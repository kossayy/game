import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useGame } from '../context/GameContext';

import HomeScreen from './phases/HomeScreen';
import Lobby from './phases/Lobby';
import WritingPhase from './phases/WritingPhase';
import VotingPhase from './phases/VotingPhase';
import ResultsPhase from './phases/ResultsPhase';
import Scoreboard from './phases/Scoreboard';
import FinishedScreen from './phases/FinishedScreen';
import Countdown from './Countdown';

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
};

export default function Game() {
  const { socket } = useSocket();
  const { state, dispatch } = useGame();
  const { phase } = state;

  // Wire all socket events here so they're always active
  useEffect(() => {
    if (!socket) return;

    socket.on('phase:writing', (data) => {
      dispatch({ type: 'PHASE_WRITING', payload: data });
    });

    socket.on('phase:voting', (data) => {
      dispatch({
        type: 'PHASE_VOTING',
        payload: {
          question: data.question,
          currentRound: data.round,
          totalRounds: data.totalRounds,
          answers: data.answers,
        }
      });
    });

    socket.on('phase:results', (data) => {
      dispatch({ type: 'PHASE_RESULTS', payload: data });
    });

    socket.on('phase:scoreboard', (data) => {
      dispatch({
        type: 'PHASE_SCOREBOARD',
        payload: {
          players: data.players,
          currentRound: data.currentRound,
          totalRounds: data.totalRounds,
          isLastRound: data.isLastRound,
        }
      });
    });

    socket.on('phase:finished', (data) => {
      dispatch({ type: 'PHASE_FINISHED', payload: { players: data.players } });
    });

    socket.on('timer', (data) => {
      dispatch({ type: 'SET_TIMER', payload: data });
    });

    socket.on('game:answerSubmitted', (data) => {
      dispatch({ type: 'UPDATE_ANSWER_COUNT', payload: data });
    });

    socket.on('game:voteSubmitted', (data) => {
      dispatch({ type: 'UPDATE_VOTE_COUNT', payload: data });
    });

    socket.on('room:playerJoined', ({ players }) => {
      dispatch({ type: 'UPDATE_PLAYERS', payload: players });
    });

    return () => {
      socket.off('phase:writing');
      socket.off('phase:voting');
      socket.off('phase:results');
      socket.off('phase:scoreboard');
      socket.off('phase:finished');
      socket.off('timer');
      socket.off('game:answerSubmitted');
      socket.off('game:voteSubmitted');
      socket.off('room:playerJoined');
    };
  }, [socket]);

  const renderPhase = () => {
    switch (phase) {
      case 'home':       return <HomeScreen />;
      case 'lobby':      return <Lobby />;
      case 'countdown':  return <Countdown onDone={() => {}} />;
      case 'writing':    return <WritingPhase />;
      case 'voting':     return <VotingPhase />;
      case 'results':    return <ResultsPhase />;
      case 'scoreboard': return <Scoreboard />;
      case 'finished':   return <FinishedScreen />;
      default:           return <HomeScreen />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        variants={PAGE_VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen"
      >
        {renderPhase()}
      </motion.div>
    </AnimatePresence>
  );
}
