require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');
const { Room, Leaderboard } = require('./models');
const { getAIQuestion, getRandomQuestions, shuffleArray } = require('./questions');

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Connect MongoDB (graceful fallback to in-memory)
const rooms = new Map(); // In-memory fallback

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sab3')
  .then(() => console.log('MongoDB connected'))
  .catch(() => console.log('MongoDB not available, using in-memory store'));

// ─── REST ROUTES ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/leaderboard', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const top = await Leaderboard.find().sort({ score: -1 }).limit(10).lean();
      return res.json(top);
    }
  } catch (e) {}
  res.json([]);
});

app.get('/api/room/:code', async (req, res) => {
  const code = req.params.code.toUpperCase();
  try {
    if (mongoose.connection.readyState === 1) {
      const room = await Room.findOne({ code }).lean();
      if (room) return res.json({ exists: true, status: room.status, playerCount: room.players.length });
    } else if (rooms.has(code)) {
      const room = rooms.get(code);
      return res.json({ exists: true, status: room.status, playerCount: room.players.length });
    }
  } catch (e) {}
  res.json({ exists: false });
});

// ─── SOCKET.IO GAME ENGINE ────────────────────────────────────────────────────

const PHASE = {
  WAITING: 'waiting',
  WRITING: 'writing',
  VOTING: 'voting',
  RESULTS: 'results',
  SCOREBOARD: 'scoreboard',
  FINISHED: 'finished'
};

const TIMERS = {
  WRITING: 60,
  VOTING: 30,
  RESULTS: 8,
  SCOREBOARD: 6
};

// Active timers
const activeTimers = new Map();

function clearRoomTimer(code) {
  if (activeTimers.has(code)) {
    clearInterval(activeTimers.get(code));
    activeTimers.delete(code);
  }
}

async function getRoom(code) {
  if (mongoose.connection.readyState === 1) {
    return await Room.findOne({ code });
  }
  return rooms.get(code) || null;
}

async function saveRoom(roomData) {
  if (mongoose.connection.readyState === 1) {
    if (roomData._id) {
      await Room.findByIdAndUpdate(roomData._id, roomData);
    } else {
      const r = new Room(roomData);
      await r.save();
      return r;
    }
  } else {
    rooms.set(roomData.code, roomData);
  }
  return roomData;
}

async function deleteRoom(code) {
  if (mongoose.connection.readyState === 1) {
    await Room.deleteOne({ code });
  } else {
    rooms.delete(code);
  }
}

function startTimer(roomCode, duration, onTick, onEnd) {
  clearRoomTimer(roomCode);
  let remaining = duration;
  onTick(remaining);
  const interval = setInterval(async () => {
    remaining--;
    onTick(remaining);
    if (remaining <= 0) {
      clearRoomTimer(roomCode);
      await onEnd();
    }
  }, 1000);
  activeTimers.set(roomCode, interval);
}

async function startWritingPhase(roomCode) {
  const room = await getRoom(roomCode);
  if (!room) return;

  const q = room.questions[room.currentRound];
  io.to(roomCode).emit('phase:writing', {
    round: room.currentRound + 1,
    totalRounds: room.maxRounds,
    question: q.question,
    category: q.category
  });

  startTimer(
    roomCode,
    TIMERS.WRITING,
    (t) => io.to(roomCode).emit('timer', { seconds: t, phase: PHASE.WRITING }),
    () => startVotingPhase(roomCode)
  );
}

async function startVotingPhase(roomCode) {
  const room = await getRoom(roomCode);
  if (!room) return;

  const q = room.questions[room.currentRound];
  const round = room.rounds[room.currentRound];

  // Build answer pool: all fake answers + correct answer
  const answers = [];

  // Add correct answer
  answers.push({
    id: 'correct',
    text: q.answer,
    playerId: null,
    isCorrect: true
  });

  // Add player fake answers
  Object.entries(round.answers || {}).forEach(([playerId, text]) => {
    if (text && text.trim()) {
      answers.push({
        id: playerId,
        text: text.trim(),
        playerId,
        isCorrect: false
      });
    }
  });

  const shuffled = shuffleArray(answers);
  round.answerPool = shuffled;

  if (mongoose.connection.readyState === 1) {
    await Room.findOneAndUpdate(
      { code: roomCode },
      { $set: { [`rounds.${room.currentRound}.answerPool`]: shuffled } }
    );
  } else {
    rooms.set(roomCode, room);
  }

  io.to(roomCode).emit('phase:voting', {
    round: room.currentRound + 1,
    totalRounds: room.maxRounds,
    question: q.question,
    answers: shuffled.map(a => ({ id: a.id, text: a.text }))
  });

  startTimer(
    roomCode,
    TIMERS.VOTING,
    (t) => io.to(roomCode).emit('timer', { seconds: t, phase: PHASE.VOTING }),
    () => showResults(roomCode)
  );
}

async function showResults(roomCode) {
  const room = await getRoom(roomCode);
  if (!room) return;

  const q = room.questions[room.currentRound];
  const round = room.rounds[room.currentRound];
  const answerPool = round.answerPool || [];
  const votes = round.votes || {};
  const updates = {};

  // Calculate scores
  Object.entries(votes).forEach(([voterId, chosenId]) => {
    if (chosenId === 'correct') {
      // Player guessed correctly: +2
      updates[voterId] = (updates[voterId] || 0) + 2;
    } else {
      // Someone voted for a fake answer: +1 to the fake answer author
      updates[chosenId] = (updates[chosenId] || 0) + 1;
    }
  });

  // Apply score updates
  room.players.forEach(p => {
    if (updates[p.id]) p.score += updates[p.id];
  });

  // Build results data
  const resultsData = answerPool.map(a => ({
    id: a.id,
    text: a.text,
    isCorrect: a.isCorrect,
    playerId: a.playerId,
    playerName: a.playerId ? room.players.find(p => p.id === a.playerId)?.name : null,
    votes: Object.values(votes).filter(v => v === a.id).length,
    scoredBy: Object.entries(votes)
      .filter(([_, v]) => v === a.id)
      .map(([vid]) => room.players.find(p => p.id === vid)?.name)
      .filter(Boolean)
  }));

  if (mongoose.connection.readyState === 1) {
    await Room.findOneAndUpdate(
      { code: roomCode },
      { $set: { players: room.players } }
    );
  } else {
    rooms.set(roomCode, room);
  }

  io.to(roomCode).emit('phase:results', {
    round: room.currentRound + 1,
    question: q.question,
    correctAnswer: q.answer,
    results: resultsData,
    scoreUpdates: updates
  });

  setTimeout(() => showScoreboard(roomCode), TIMERS.RESULTS * 1000);
}

async function showScoreboard(roomCode) {
  const room = await getRoom(roomCode);
  if (!room) return;

  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  const isLast = room.currentRound >= room.maxRounds - 1;

  io.to(roomCode).emit('phase:scoreboard', {
    players: sorted,
    isLastRound: isLast,
    currentRound: room.currentRound + 1,
    totalRounds: room.maxRounds
  });

  if (!isLast) {
    setTimeout(async () => {
      const r = await getRoom(roomCode);
      if (!r) return;
      r.currentRound++;
      if (mongoose.connection.readyState === 1) {
        await Room.findOneAndUpdate({ code: roomCode }, { $set: { currentRound: r.currentRound } });
      } else {
        rooms.set(roomCode, r);
      }
      startWritingPhase(roomCode);
    }, TIMERS.SCOREBOARD * 1000);
  } else {
    // Save to leaderboard
    if (mongoose.connection.readyState === 1) {
      const entries = room.players.map(p => ({ playerName: p.name, score: p.score, roomCode }));
      await Leaderboard.insertMany(entries).catch(() => {});
      await Room.findOneAndUpdate({ code: roomCode }, { $set: { status: 'finished' } });
    }
    io.to(roomCode).emit('phase:finished', { players: sorted });
  }
}

// ─── SOCKET EVENTS ────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // CREATE ROOM
  socket.on('room:create', async ({ playerName, maxRounds = 5 }) => {
    try {
      const code = nanoid();
      const avatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(playerName)}&backgroundColor=0a0a0a`;
      const player = { id: socket.id, name: playerName, avatar, score: 0, connected: true };
      const questions = getRandomQuestions(maxRounds);

      const roomData = {
        code,
        hostId: socket.id,
        players: [player],
        status: 'waiting',
        currentRound: 0,
        maxRounds,
        questions,
        rounds: questions.map(() => ({ answers: {}, votes: {}, answerPool: [] }))
      };

      await saveRoom(roomData);
      socket.join(code);
      socket.data.roomCode = code;
      socket.data.playerId = socket.id;

      socket.emit('room:created', { code, player, room: { ...roomData, questions: undefined } });
      console.log(`Room ${code} created by ${playerName}`);
    } catch (e) {
      socket.emit('error', { message: 'Failed to create room: ' + e.message });
    }
  });

  // JOIN ROOM
  socket.on('room:join', async ({ code, playerName }) => {
    try {
      const upperCode = code.toUpperCase();
      const room = await getRoom(upperCode);

      if (!room) return socket.emit('error', { message: 'errorRoomNotFound' });
      if (room.status === 'finished') return socket.emit('error', { message: 'errorGameFinished' });
      if (room.players.length >= 7) return socket.emit('error', { message: 'errorRoomFull' });

      const avatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(playerName)}&backgroundColor=0a0a0a`;
      const player = { id: socket.id, name: playerName, avatar, score: 0, connected: true };
      room.players.push(player);

      if (mongoose.connection.readyState === 1) {
        await Room.findOneAndUpdate({ code: upperCode }, { $push: { players: player } });
      } else {
        rooms.set(upperCode, room);
      }

      socket.join(upperCode);
      socket.data.roomCode = upperCode;
      socket.data.playerId = socket.id;

      socket.emit('room:joined', { code: upperCode, player, room: { ...room, questions: undefined } });
      io.to(upperCode).emit('room:playerJoined', { player, players: room.players });
      console.log(`${playerName} joined room ${upperCode}`);
    } catch (e) {
      socket.emit('error', { message: 'Failed to join room: ' + e.message });
    }
  });

  // START GAME (host only)
  socket.on('game:start', async () => {
    const code = socket.data.roomCode;
    const room = await getRoom(code);
    if (!room) return;
    if (room.hostId !== socket.id) return socket.emit('error', { message: 'errorHostOnly' });
    if (room.players.length < 2) return socket.emit('error', { message: 'errorMinPlayers' });

    if (mongoose.connection.readyState === 1) {
      await Room.findOneAndUpdate({ code }, { $set: { status: 'playing' } });
    } else {
      room.status = 'playing';
      rooms.set(code, room);
    }

    io.to(code).emit('game:started', { totalRounds: room.maxRounds });
    setTimeout(() => startWritingPhase(code), 1000);
  });

  // SUBMIT ANSWER
  socket.on('game:submitAnswer', async ({ answer }) => {
    const code = socket.data.roomCode;
    const room = await getRoom(code);
    if (!room) return;

    const round = room.rounds[room.currentRound];
    round.answers[socket.id] = answer;

    if (mongoose.connection.readyState === 1) {
      await Room.findOneAndUpdate(
        { code },
        { $set: { [`rounds.${room.currentRound}.answers.${socket.id}`]: answer } }
      );
    } else {
      rooms.set(code, room);
    }

    // Notify room that this player submitted (without revealing answer)
    io.to(code).emit('game:answerSubmitted', {
      playerId: socket.id,
      playerName: room.players.find(p => p.id === socket.id)?.name,
      totalSubmitted: Object.keys(round.answers).length,
      totalPlayers: room.players.filter(p => p.connected).length
    });

    // Auto-advance if everyone submitted
    const connected = room.players.filter(p => p.connected).length;
    if (Object.keys(round.answers).length >= connected) {
      clearRoomTimer(code);
      startVotingPhase(code);
    }
  });

  // SUBMIT VOTE
  socket.on('game:submitVote', async ({ answerId }) => {
    const code = socket.data.roomCode;
    const room = await getRoom(code);
    if (!room) return;

    // Can't vote for your own fake answer
    if (answerId === socket.id) return socket.emit('error', { message: "You can't vote for your own answer!" });

    const round = room.rounds[room.currentRound];
    round.votes[socket.id] = answerId;

    if (mongoose.connection.readyState === 1) {
      await Room.findOneAndUpdate(
        { code },
        { $set: { [`rounds.${room.currentRound}.votes.${socket.id}`]: answerId } }
      );
    } else {
      rooms.set(code, room);
    }

    io.to(code).emit('game:voteSubmitted', {
      playerId: socket.id,
      totalVoted: Object.keys(round.votes).length,
      totalPlayers: room.players.filter(p => p.connected).length
    });

    // Auto-advance if everyone voted
    const connected = room.players.filter(p => p.connected).length;
    if (Object.keys(round.votes).length >= connected) {
      clearRoomTimer(code);
      showResults(code);
    }
  });

  // RESTART GAME (host only)
  socket.on('game:restart', async () => {
    const code = socket.data.roomCode;
    const room = await getRoom(code);
    if (!room || room.hostId !== socket.id) return;

    const questions = getRandomQuestions(room.maxRounds);
    const resetPlayers = room.players.map(p => ({ ...p, score: 0 }));
    const updates = {
      status: 'waiting',
      currentRound: 0,
      questions,
      rounds: questions.map(() => ({ answers: {}, votes: {}, answerPool: [] })),
      players: resetPlayers
    };

    if (mongoose.connection.readyState === 1) {
      await Room.findOneAndUpdate({ code }, { $set: updates });
    } else {
      Object.assign(room, updates);
      rooms.set(code, room);
    }

    io.to(code).emit('game:restarted', { players: resetPlayers });
  });

  // DISCONNECT
  socket.on('disconnect', async () => {
    const code = socket.data.roomCode;
    if (!code) return;

    const room = await getRoom(code);
    if (!room) return;

    if (mongoose.connection.readyState === 1) {
      await Room.findOneAndUpdate(
        { code, 'players.id': socket.id },
        { $set: { 'players.$.connected': false } }
      );
    } else {
      const p = room.players.find(p => p.id === socket.id);
      if (p) p.connected = false;
      rooms.set(code, room);
    }

    io.to(code).emit('room:playerLeft', {
      playerId: socket.id,
      playerName: room.players.find(p => p.id === socket.id)?.name
    });

    console.log(`Player ${socket.id} disconnected from room ${code}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Sab3 server running on port ${PORT}`));
