import { createContext, useContext, useReducer } from 'react';

const GameContext = createContext(null);

const initialState = {
  phase: 'home', // home | lobby | writing | voting | results | scoreboard | finished
  room: null,
  player: null,
  players: [],
  currentRound: 0,
  totalRounds: 5,
  question: null,
  category: null,
  answers: [], // for voting phase
  results: null,
  timer: 0,
  timerPhase: null,
  submittedAnswer: false,
  submittedVote: false,
  answersSubmitted: 0,
  votesSubmitted: 0,
  scoreUpdates: {},
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYER': return { ...state, player: action.payload };
    case 'SET_ROOM': return { ...state, room: action.payload };
    case 'JOIN_LOBBY': return { ...state, ...action.payload, phase: 'lobby' };
    case 'UPDATE_PLAYERS': return { ...state, players: action.payload };
    case 'GAME_STARTED': return { ...state, phase: 'countdown', totalRounds: action.payload.totalRounds };
    case 'PHASE_WRITING': return {
      ...state,
      phase: 'writing',
      ...action.payload,
      submittedAnswer: false,
      answersSubmitted: 0,
      votesSubmitted: 0
    };
    case 'PHASE_VOTING': return {
      ...state,
      phase: 'voting',
      ...action.payload,
      submittedVote: false,
    };
    case 'PHASE_RESULTS': return { ...state, phase: 'results', results: action.payload };
    case 'PHASE_SCOREBOARD': return { ...state, phase: 'scoreboard', ...action.payload };
    case 'PHASE_FINISHED': return { ...state, phase: 'finished', ...action.payload };
    case 'SET_TIMER': return { ...state, timer: action.payload.seconds, timerPhase: action.payload.phase };
    case 'SUBMITTED_ANSWER': return { ...state, submittedAnswer: true };
    case 'SUBMITTED_VOTE': return { ...state, submittedVote: true };
    case 'UPDATE_ANSWER_COUNT': return { ...state, answersSubmitted: action.payload.totalSubmitted };
    case 'UPDATE_VOTE_COUNT': return { ...state, votesSubmitted: action.payload.totalVoted };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'CLEAR_ERROR': return { ...state, error: null };
    case 'GAME_RESTARTED': return {
      ...initialState,
      phase: 'lobby',
      room: state.room,
      player: state.player,
      players: action.payload.players,
    };
    default: return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
