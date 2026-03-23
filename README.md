# SAB3 — The Bluffing Game 🎮

A real-time multiplayer bluffing/trivia game. Players write fake answers to questions, vote on what they think is real, and score points for correct guesses and for fooling others.

```
 ███████╗ █████╗ ██████╗ ██████╗
 ██╔════╝██╔══██╗██╔══██╗╚════██╗
 ███████╗███████║██████╔╝ █████╔╝
 ╚════██║██╔══██║██╔══██╗ ╚═══██╗
 ███████║██║  ██║██████╔╝██████╔╝
 ╚══════╝╚═╝  ╚═╝╚═════╝ ╚═════╝
```

## Project Structure

```
sab3/
├── backend/
│   ├── server.js          # Express + Socket.IO game server
│   ├── models.js          # MongoDB schemas (Room, Leaderboard)
│   ├── questions.js       # Question bank + AI question generator
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── components/
    │   ├── Game.js                     # Phase orchestrator + socket wiring
    │   ├── NeonHero.js                 # Three.js 3D neon background
    │   ├── PlayerAvatar.js             # Neon avatar component
    │   ├── TimerBar.js                 # Animated countdown bar
    │   ├── Countdown.js                # 3-2-1 countdown screen
    │   └── phases/
    │       ├── HomeScreen.js           # Create / Join room
    │       ├── Lobby.js                # Waiting room + player list
    │       ├── WritingPhase.js         # Submit fake answer
    │       ├── VotingPhase.js          # Vote on answers
    │       ├── ResultsPhase.js         # Reveal + score updates
    │       ├── Scoreboard.js           # Between-round rankings
    │       └── FinishedScreen.js       # Final results + restart
    ├── context/
    │   ├── SocketContext.js            # Socket.IO provider
    │   └── GameContext.js              # Game state (useReducer)
    ├── pages/
    │   ├── index.js
    │   ├── room/[code].js              # Direct link join (/room/ABC123)
    │   └── leaderboard/index.js
    ├── styles/globals.css
    ├── tailwind.config.js
    └── package.json
```

## Scoring System

| Action | Points |
|--------|--------|
| Pick the correct answer | +2 |
| Someone picks your fake answer | +1 |

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — add MongoDB URI (optional) and Anthropic API key (optional)
npm install
npm run dev
# Server starts on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
# App starts on http://localhost:3000
```

### 3. Play

1. Open `http://localhost:3000`
2. Click **CREATE ROOM** — enter your name
3. Share the room code or link `/room/XXXXXX` with friends
4. Click **START GAME** (host only, requires 2+ players)
5. Each round:
   - Read the question → write a convincing fake answer
   - Vote on which answer you think is real
   - See who fooled who → scores update
6. After all rounds → Final leaderboard

## Environment Variables

### Backend `.env`
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/sab3   # optional, uses in-memory if omitted
ANTHROPIC_API_KEY=sk-ant-...                 # optional, enables AI questions
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

## Production Deployment

### Backend (e.g. Railway, Render, Fly.io)
```bash
cd backend
npm start
```
Set env vars: `PORT`, `MONGODB_URI`, `FRONTEND_URL`, `ANTHROPIC_API_KEY`

### Frontend (e.g. Vercel)
```bash
cd frontend
npm run build
```
Set env var: `NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app`

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Three.js, Socket.IO client
- **Backend**: Node.js, Express, Socket.IO, Mongoose
- **Database**: MongoDB (optional — falls back to in-memory Map)
- **AI Questions**: Anthropic Claude API (optional)
- **Fonts**: Orbitron (display), Rajdhani (body), Share Tech Mono

## Game Flow (Socket Events)

```
Client → Server          Server → Client
──────────────────       ────────────────────────
room:create         →    room:created
room:join           →    room:joined
                    ←    room:playerJoined
game:start          →    game:started
                    ←    phase:writing  (60s timer)
game:submitAnswer   →    game:answerSubmitted
                    ←    phase:voting   (30s timer)
game:submitVote     →    game:voteSubmitted
                    ←    phase:results  (8s auto)
                    ←    phase:scoreboard
                    ←    phase:writing (next round)
                    ←    phase:finished (last round)
game:restart        →    game:restarted
```
"# SAB3" 
"# game" 
