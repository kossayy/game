import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { useLanguage } from '../../context/LanguageContext';
import PlayerAvatar from '../PlayerAvatar';

const RANK_COLORS = ['#ffee00', '#aaaaaa', '#cd7f32'];

export default function Scoreboard() {
  const { state } = useGame();
  const { t, language } = useLanguage();
  const { players: sorted, currentRound, totalRounds, isLastRound } = state;

  const getRankLabel = (index) => {
    if (language === 'ar') {
      const labels = ['الأول', 'الثاني', 'الثالث'];
      return labels[index] || `${index + 1}`;
    }
    const labels = ['1ST', '2ND', '3RD'];
    return labels[index] || `${index + 1}TH`;
  };

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex flex-col items-center justify-center p-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255,238,0,0.05) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-lg">
        <motion.div className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="font-mono text-xs tracking-widest opacity-40 mb-1 uppercase">
            {isLastRound ? t('finalResults') : `${t('afterRound')} ${currentRound} / ${totalRounds}`}
          </p>
          <h2
            className="font-display text-4xl font-black uppercase"
            style={{
              background: 'linear-gradient(135deg, #ffee00, #ff00aa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('scoreboard')}
          </h2>
        </motion.div>

        <div className="space-y-3">
          {sorted?.map((p, i) => {
            const rankColor = RANK_COLORS[i] || '#e0e0ff';
            return (
              <motion.div
                key={p.id}
                initial={{ x: i % 2 === 0 ? -40 : 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                className="neon-card p-4 flex items-center gap-4"
                style={{
                  borderColor: i === 0 ? '#ffee0040' : i === 1 ? '#aaaaaa30' : undefined,
                  background: i === 0
                    ? 'linear-gradient(135deg, rgba(255,238,0,0.08), rgba(255,238,0,0.02))'
                    : undefined,
                }}
              >
                {/* Rank */}
                <div className={`font-display font-black w-12 text-center flex-shrink-0 ${language === 'ar' ? 'text-sm' : 'text-lg'}`}
                  style={{ color: rankColor }}>
                  {getRankLabel(i)}
                </div>

                {/* Avatar */}
                <PlayerAvatar player={p} size="sm" showName={false} glow={i < 3} />

                {/* Name */}
                <div className="flex-1 min-w-0 text-left rtl:text-right">
                  <div className="font-display font-bold truncate" style={{ color: rankColor }}>
                    {p.name}
                  </div>
                </div>

                {/* Score */}
                <motion.div
                  className="font-display text-2xl font-black flex-shrink-0"
                  style={{ color: rankColor }}
                  animate={i === 0 ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {p.score}
                </motion.div>
                <div className="font-mono text-xs opacity-30 flex-shrink-0 uppercase">{t('pts')}</div>
              </motion.div>
            );
          })}
        </div>

        {!isLastRound && (
          <motion.p
            className="text-center font-mono text-xs opacity-30 mt-6 uppercase"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {t('nextRoundStarting')}
          </motion.p>
        )}
      </div>
    </div>
  );
}
