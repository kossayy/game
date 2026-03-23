import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { useLanguage } from '../../context/LanguageContext';
import TimerBar from '../TimerBar';

export default function VotingPhase() {
  const { socket } = useSocket();
  const { state, dispatch } = useGame();
  const { t, language } = useLanguage();
  const { question, answers, currentRound, totalRounds, timer, submittedVote, votesSubmitted, players, player } = state;
  const [selected, setSelected] = useState(null);

  const handleVote = (answerId) => {
    if (submittedVote || !socket) return;
    if (answerId === player?.id) return; // can't vote own answer
    setSelected(answerId);
    socket.emit('game:submitVote', { answerId });
    dispatch({ type: 'SUBMITTED_VOTE' });
  };

  const connectedPlayers = players.filter(p => p.connected !== false).length;
  const maxTimer = 30;

  const displayQuestion = typeof question === 'object' ? question[language] : question;

  const NEON_COLORS = ['#00f0ff', '#bf00ff', '#ff00aa', '#00ff88', '#ffee00', '#ff6600'];

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex flex-col items-center justify-center p-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 10%, rgba(0,240,255,0.05) 0%, transparent 80%)' }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <motion.div className="flex justify-between items-center mb-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="font-mono text-xs tracking-widest opacity-40 uppercase">
            {t('round')} {currentRound} / {totalRounds}
          </span>
          <span className="font-display text-xs px-3 py-1 uppercase"
            style={{ color: '#ff00aa', border: '1px solid #ff00aa40', background: '#ff00aa10' }}>
            {t('voteNow')}
          </span>
        </motion.div>

        {/* Timer */}
        <div className="mb-6">
          <TimerBar seconds={timer} maxSeconds={maxTimer} phase={t('votingTime').toUpperCase()} />
        </div>

        {/* Question */}
        <motion.div className="neon-card p-6 mb-6 text-center"
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <p className="font-mono text-xs tracking-widest mb-2 uppercase" style={{ color: '#ff00aa80' }}>
            {t('whichReal')}
          </p>
          <h2 className="font-display text-xl md:text-2xl font-bold font-arabic" style={{ color: '#e0e0ff' }}>
            {displayQuestion}
          </h2>
        </motion.div>

        {/* Answer choices */}
        <div className="space-y-3 mb-6 text-left rtl:text-right">
          <AnimatePresence>
            {answers?.map((ans, i) => {
              const isOwn = ans.id === player?.id;
              const isSelected = selected === ans.id;
              const color = NEON_COLORS[i % NEON_COLORS.length];
              const displayText = typeof ans.text === 'object' ? ans.text[language] : ans.text;

              return (
                <motion.button
                  key={ans.id}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleVote(ans.id)}
                  disabled={submittedVote || isOwn}
                  className="w-full text-left p-4 transition-all duration-200 relative overflow-hidden"
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${color}20, ${color}10)`
                      : isOwn
                      ? 'rgba(255,255,255,0.02)'
                      : 'linear-gradient(135deg, rgba(15,15,26,0.8), rgba(10,10,18,0.8))',
                    border: `1px solid ${isSelected ? color : isOwn ? 'rgba(255,255,255,0.05)' : `${color}30`}`,
                    boxShadow: isSelected ? `0 0 20px ${color}40` : 'none',
                    cursor: submittedVote || isOwn ? 'default' : 'pointer',
                    opacity: isOwn ? 0.4 : 1,
                  }}
                  whileHover={!submittedVote && !isOwn ? { scale: 1.01, x: 4 } : {}}
                  whileTap={!submittedVote && !isOwn ? { scale: 0.99 } : {}}
                >
                  {/* Answer letter */}
                  <div className="flex items-start gap-4">
                    <span className="font-display text-lg font-bold flex-shrink-0 w-8 text-center"
                      style={{ color }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="font-body text-base leading-snug" style={{ color: isSelected ? '#fff' : '#e0e0ff' }}>
                      {displayText}
                    </span>
                    {isSelected && (
                      <motion.span
                        className="ml-auto flex-shrink-0 font-display text-sm rtl:mr-auto rtl:ml-0"
                        style={{ color }}
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </div>
                  {isOwn && (
                    <p className="font-mono text-xs opacity-40 mt-1 ml-12 rtl:mr-12 rtl:ml-0 uppercase">{t('yourAnswer')}</p>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Status */}
        {submittedVote && (
          <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="font-display text-sm neon-text-green mb-1 uppercase">✓ {t('voteSubmitted')}</p>
            <motion.p className="font-mono text-xs opacity-40 uppercase"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}>
              {t('waitingOthers')} ({votesSubmitted}/{connectedPlayers})
            </motion.p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
