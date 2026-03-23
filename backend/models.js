const mongoose = require('mongoose');

// Room Schema
const RoomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  hostId: String,
  players: [{
    id: String,
    name: String,
    avatar: String,
    score: { type: Number, default: 0 },
    connected: { type: Boolean, default: true }
  }],
  status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
  currentRound: { type: Number, default: 0 },
  maxRounds: { type: Number, default: 5 },
  questions: [{ type: mongoose.Schema.Types.Mixed }],
  rounds: [{ type: mongoose.Schema.Types.Mixed }],
  createdAt: { type: Date, default: Date.now, expires: 3600 }
});

// Leaderboard Schema
const LeaderboardSchema = new mongoose.Schema({
  playerName: { type: String, required: true },
  score: { type: Number, required: true },
  roomCode: String,
  date: { type: Date, default: Date.now }
});

module.exports = {
  Room: mongoose.model('Room', RoomSchema),
  Leaderboard: mongoose.model('Leaderboard', LeaderboardSchema)
};
