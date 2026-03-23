import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { useLanguage } from '../../context/LanguageContext';
import PlayerAvatar from '../PlayerAvatar';

export default function Lobby() {
  const { socket } = useSocket();
  const { state, dispatch } = useGame();
  const { t } = useLanguage();
  const { room, player, players } = state;
  const isHost = player?.id === room?.hostId;
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${room?.code}`
    : '';

  useEffect(() => {
    if (!socket) return;

    socket.on('room:playerJoined', ({ players }) => {
      dispatch({ type: 'UPDATE_PLAYERS', payload: players });
    });

    socket.on('room:playerLeft', ({ playerId }) => {
      dispatch({ type: 'UPDATE_PLAYERS', payload: players.filter(p => p.id !== playerId) });
    });

    socket.on('game:started', (data) => {
      dispatch({ type: 'GAME_STARTED', payload: data });
    });

    socket.on('error', ({ message }) => {
      dispatch({ type: 'SET_ERROR', payload: message });
    });

    return () => {
      socket.off('room:playerJoined');
      socket.off('room:playerLeft');
      socket.off('game:started');
      socket.off('error');
    };
  }, [socket, players]);

  const handleStart = () => {
    if (!socket) return;
    socket.emit('game:start');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex flex-col items-center justify-center p-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(0,240,255,0.05) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-lg">
        {/* Room header */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="font-mono text-xs tracking-widest opacity-40 mb-2">{t('roomCode')}</p>
          <div className="inline-flex items-center gap-4">
            <h1 className="font-display text-5xl font-black tracking-widest neon-text-blue">
              {room?.code}
            </h1>
            <button
              onClick={copyLink}
              className="btn-neon btn-neon-blue text-xs py-2 px-3"
              title={t('copyLink')}
            >
              {t('copyLink')}
            </button>
          </div>
          <p className="font-mono text-xs opacity-30 mt-2 tracking-wider">
            {t('shareCode')}
          </p>
        </motion.div>

        {/* Players grid */}
        <motion.div
          className="neon-card p-6 mb-6"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-sm tracking-widest" style={{ color: '#bf00ff' }}>
              {t('playersOnline')}
            </h2>
            <span className="font-mono text-xs opacity-40">
              {players.length} / 7
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <AnimatePresence>
              {players.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center"
                >
                  <PlayerAvatar player={p} size="md" showName={true} />
                  {p.id === room?.hostId && (
                    <span className="font-mono text-xs mt-1 uppercase" style={{ color: '#ffee00' }}>{t('hostLabel')}</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {players.length < 2 && (
            <motion.p
              className="text-center font-mono text-xs opacity-40 mt-4"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {t('waitingPlayers')}
            </motion.p>
          )}
        </motion.div>

        {/* Game info */}
        <motion.div
          className="neon-card p-4 mb-6 flex justify-around"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <div className="font-display text-2xl neon-text-purple">{room?.maxRounds || 5}</div>
            <div className="font-mono text-xs opacity-40 uppercase">{t('rounds')}</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl neon-text-pink">+2</div>
            <div className="font-mono text-xs opacity-40 uppercase">{t('correctGuess')}</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl neon-text-blue">+1</div>
            <div className="font-mono text-xs opacity-40 uppercase">{t('foolSomeone')}</div>
          </div>
        </motion.div>

        {/* Error */}
        {state.error && (
          <motion.p className="text-center font-mono text-sm mb-4" style={{ color: '#ff00aa' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            ⚠ {t(state.error)}
          </motion.p>
        )}

        {/* Start button */}
        {isHost ? (
          <motion.button
            onClick={handleStart}
            disabled={players.length < 2}
            className="btn-neon btn-neon-green w-full py-5 text-base"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {players.length < 2 ? t('waitingPlayers').toUpperCase() : `⚡ ${t('startGame')}`}
          </motion.button>
        ) : (
          <motion.div
            className="text-center font-mono text-sm opacity-40"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {t('waitingHost')}
          </motion.div>
        )}
      </div>
    </div>
  );
}
