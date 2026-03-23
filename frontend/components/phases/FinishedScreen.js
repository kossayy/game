import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { useLanguage } from '../../context/LanguageContext';
import PlayerAvatar from '../PlayerAvatar';

const RANK_COLORS = ['#ffee00', '#aaaaaa', '#cd7f32'];

export default function FinishedScreen() {
  const { socket } = useSocket();
  const { state, dispatch } = useGame();
  const { t } = useLanguage();
  const { players, room, player } = state;
  const isHost = player?.id === room?.hostId;

  useEffect(() => {
    if (!socket) return;
    socket.on('game:restarted', ({ players }) => {
      dispatch({ type: 'GAME_RESTARTED', payload: { players } });
    });
    return () => socket.off('game:restarted');
  }, [socket]);

  const handleRestart = () => {
    if (!socket) return;
    socket.emit('game:restart');
  };

  const winner = players?.[0];

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(255,238,0,0.08) 0%, rgba(255,0,170,0.05) 50%, transparent 80%)' }}
      />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: ['#ffee00', '#00f0ff', '#ff00aa', '#00ff88', '#bf00ff'][i % 5],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, -80, -20],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Game Over title */}
        <motion.div className="mb-8"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}>
          <h1
            className="font-display text-5xl md:text-7xl font-black mb-2 uppercase"
            style={{
              background: 'linear-gradient(135deg, #ffee00, #ff00aa, #00f0ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(255,238,0,0.5))',
            }}
          >
            {t('finished')}
          </h1>
          <div className="h-px w-64 mx-auto"
            style={{ background: 'linear-gradient(90deg, transparent, #ffee00, transparent)' }} />
        </motion.div>

        {/* Winner spotlight */}
        {winner && (
          <motion.div
            className="mb-8 p-6 neon-card"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ borderColor: '#ffee0040', background: 'linear-gradient(135deg, rgba(255,238,0,0.08), transparent)' }}
          >
            <p className="font-mono text-xs tracking-widest mb-3 uppercase" style={{ color: '#ffee0060' }}>
              👑 {t('winner')}
            </p>
            <PlayerAvatar player={winner} size="xl" glow={true} />
            <motion.div
              className="font-display text-4xl font-black mt-3"
              style={{ color: '#ffee00' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {winner.score} {t('pts')}
            </motion.div>
          </motion.div>
        )}

        {/* Full rankings */}
        <motion.div
          className="neon-card p-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="space-y-2">
            {players?.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <span className="font-display text-sm w-12 text-center"
                  style={{ color: RANK_COLORS[i] || '#e0e0ff40' }}>
                  {i + 1}
                </span>
                <PlayerAvatar player={p} size="sm" showName={false} glow={i < 3} />
                <span className="flex-1 font-body font-semibold text-left rtl:text-right"
                  style={{ color: RANK_COLORS[i] || '#e0e0ff80' }}>
                  {p.name}
                </span>
                <span className="font-display font-bold"
                  style={{ color: RANK_COLORS[i] || '#e0e0ff' }}>
                  {p.score}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {isHost && (
            <motion.button
              onClick={handleRestart}
              className="btn-neon btn-neon-green flex-1 py-4 uppercase"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ↺ {t('playAgain')}
            </motion.button>
          )}
          <motion.button
            onClick={() => window.location.href = '/'}
            className="btn-neon btn-neon-blue flex-1 py-4 uppercase"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ← {t('home')}
          </motion.button>
          <motion.button
            onClick={() => window.location.href = '/leaderboard'}
            className="btn-neon btn-neon-pink flex-1 py-4 uppercase"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ◈ {t('leaderboard')}
          </motion.button>
        </motion.div>

        {!isHost && (
          <p className="font-mono text-xs opacity-30 mt-4 uppercase">{t('waitingHost')}</p>
        )}
      </div>

      {/* Developer Credit */}
      <motion.div
        className="fixed bottom-6 left-0 right-0 text-center z-20 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-20" style={{ color: '#00f0ff' }}>
          {t('createdBy')}
        </p>
      </motion.div>
    </div>
  );
}
