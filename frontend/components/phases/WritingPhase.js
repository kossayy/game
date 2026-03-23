import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { useLanguage } from '../../context/LanguageContext';
import TimerBar from '../TimerBar';

export default function WritingPhase() {
  const { socket } = useSocket();
  const { state, dispatch } = useGame();
  const { t, language } = useLanguage();
  const { question, category, currentRound, totalRounds, timer, submittedAnswer, answersSubmitted, players } = state;
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (!answer.trim() || submittedAnswer || !socket) return;
    socket.emit('game:submitAnswer', { answer: answer.trim() });
    dispatch({ type: 'SUBMITTED_ANSWER' });
  };

  const connectedPlayers = players.filter(p => p.connected !== false).length;
  const maxTimer = 60;

  const displayQuestion = typeof question === 'object' ? question[language] : question;
  const displayCategory = category ? t(category.toLowerCase()) : 'TRIVIA';

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex flex-col items-center justify-center p-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 10%, rgba(191,0,255,0.05) 0%, transparent 80%)' }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Round indicator */}
        <motion.div
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-xs tracking-widest opacity-40 uppercase">
            {t('round')} {currentRound} / {totalRounds}
          </span>
          <span
            className="font-display text-xs px-3 py-1 uppercase"
            style={{
              color: '#00f0ff',
              border: '1px solid #00f0ff40',
              background: '#00f0ff10'
            }}
          >
            {displayCategory}
          </span>
        </motion.div>

        {/* Timer */}
        <div className="mb-6">
          <TimerBar seconds={timer} maxSeconds={maxTimer} phase={t('answerTime').toUpperCase()} />
        </div>

        {/* Question */}
        <motion.div
          className="neon-card p-8 mb-6 text-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p className="font-mono text-xs tracking-widest mb-4 uppercase" style={{ color: '#bf00ff80' }}>
            {t('theQuestionIs')}
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight" style={{ color: '#e0e0ff' }}>
            {displayQuestion}
          </h2>
        </motion.div>

        {/* Answer input */}
        <motion.div
          className="neon-card p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {!submittedAnswer ? (
            <>
              <p className="font-mono text-xs opacity-40 mb-3 tracking-wider uppercase">
                {t('writeFakeAnswer')}
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="..."
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  maxLength={80}
                  autoFocus
                  className="neon-input flex-1"
                />
                <motion.button
                  onClick={handleSubmit}
                  disabled={!answer.trim()}
                  className="btn-neon btn-neon-purple px-6 uppercase"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('submit')}
                </motion.button>
              </div>
              <p className="font-mono text-xs opacity-20 mt-2">{answer.length}/80</p>
            </>
          ) : (
            <motion.div
              className="text-center py-4"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="text-4xl mb-3">✓</div>
              <p className="font-display text-lg neon-text-green uppercase">{t('answerLocked')}</p>
              <p className="font-mono text-sm opacity-40 mt-2">"{answer}"</p>
              <motion.div
                className="mt-4 font-mono text-xs opacity-40 uppercase"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {t('waitingOthers')} ({answersSubmitted}/{connectedPlayers})
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Submission progress */}
        {!submittedAnswer && answersSubmitted > 0 && (
          <motion.p
            className="text-center font-mono text-xs opacity-30 mt-3 uppercase"
            initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
          >
            {answersSubmitted} {t('playersSubmitted')}...
          </motion.p>
        )}
      </div>
    </div>
  );
}
