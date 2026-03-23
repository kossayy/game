import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { useLanguage } from '../../context/LanguageContext';
import PlayerAvatar from '../PlayerAvatar';

export default function ResultsPhase() {
  const { state } = useGame();
  const { t, language } = useLanguage();
  const { results, players } = state;

  if (!results) return null;

  const { question, correctAnswer, results: answerResults, scoreUpdates } = results;

  const displayQuestion = typeof question === 'object' ? question[language] : question;
  const displayCorrectAnswer = typeof correctAnswer === 'object' ? correctAnswer[language] : correctAnswer;

  const NEON_COLORS = ['#00f0ff', '#bf00ff', '#ff00aa', '#00ff88', '#ffee00', '#ff6600'];

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex flex-col items-center justify-center p-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,255,136,0.05) 0%, transparent 70%)' }}
      />

      {/* Brand Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
        <img src="/logo.png" alt="Sab3" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
        <span className="font-display font-bold tracking-tighter text-white hidden sm:block">SAB3</span>
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        <motion.div className="mb-6"
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="font-mono text-xs tracking-widest opacity-40 mb-2 uppercase">{t('truthRevealed')}</p>
          <h2 className="font-display text-xl md:text-2xl font-bold" style={{ color: '#e0e0ff' }}>
            {displayQuestion}
          </h2>
          <div className="mt-3 inline-flex flex-wrap justify-center items-center gap-2 px-4 py-2"
            style={{ background: '#00ff8820', border: '1px solid #00ff8840' }}>
            <span className="font-mono text-xs opacity-60 uppercase">{t('correctAnswerLabel')}</span>
            <span className="font-display font-bold neon-text-green">{displayCorrectAnswer}</span>
          </div>
        </motion.div>

        {/* Answer breakdown */}
        <div className="space-y-3 mb-6 text-left rtl:text-right">
          {answerResults?.map((ans, i) => {
            const color = ans.isCorrect ? '#00ff88' : NEON_COLORS[i % NEON_COLORS.length];
            const displayText = typeof ans.text === 'object' ? ans.text[language] : ans.text;

            return (
              <motion.div
                key={ans.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="neon-card p-4"
                style={{
                  borderColor: ans.isCorrect ? '#00ff8840' : `${color}20`,
                  background: ans.isCorrect
                    ? 'linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,255,136,0.03))'
                    : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="font-display text-sm font-bold flex-shrink-0 mt-0.5"
                      style={{ color }}>
                      {ans.isCorrect ? '✓' : '✗'}
                    </span>
                    <div>
                      <p className="font-body text-base" style={{ color: ans.isCorrect ? '#00ff88' : '#e0e0ff' }}>
                        {displayText}
                      </p>
                      {ans.isCorrect ? (
                        <p className="font-mono text-xs mt-1 uppercase" style={{ color: '#00ff8860' }}>{t('realAnswer')}</p>
                      ) : ans.playerName ? (
                        <p className="font-mono text-xs mt-1 opacity-40 uppercase">
                          {t('by')} {ans.playerName}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Votes */}
                  {ans.votes > 0 && (
                    <div className="flex-shrink-0 text-right rtl:text-left">
                      <div className="font-display font-bold uppercase" style={{ color }}>
                        {ans.votes} {ans.votes === 1 ? t('vote') : t('votes')}
                      </div>
                      <div className="font-mono text-xs opacity-40 mt-0.5">
                        {ans.scoredBy?.slice(0, 3).join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Score updates */}
        {Object.keys(scoreUpdates || {}).length > 0 && (
          <motion.div
            className="neon-card p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="font-mono text-xs tracking-widest opacity-40 mb-3 uppercase">{t('roundScores')}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              {Object.entries(scoreUpdates).map(([pid, pts]) => {
                const p = players.find(pl => pl.id === pid);
                if (!p) return null;
                return (
                  <motion.div
                    key={pid}
                    className="flex items-center gap-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.6 }}
                  >
                    <PlayerAvatar player={p} size="sm" showName={false} />
                    <div>
                      <div className="font-mono text-xs opacity-60">{p.name}</div>
                      <motion.div
                        className="font-display font-bold neon-text-green"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                      >
                        +{pts}
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        <motion.p
          className="text-center font-mono text-xs opacity-20 mt-6 uppercase"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {t('scoreboard').toUpperCase()}...
        </motion.p>
      </div>
    </div>
  );
}
