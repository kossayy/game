import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { useLanguage } from '../../context/LanguageContext';

const NeonHero = dynamic(() => import('../NeonHero'), { ssr: false });

export default function HomeScreen() {
  const { socket } = useSocket();
  const { dispatch } = useGame();
  const { t, language } = useLanguage();
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [rounds, setRounds] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;
    // Check URL for room code
    const path = window.location.pathname;
    const match = path.match(/\/room\/([A-Z0-9]{6})/i);
    if (match) {
      setRoomCode(match[1].toUpperCase());
      setMode('join');
    }

    socket.on('room:created', ({ code, player, room }) => {
      setLoading(false);
      dispatch({ type: 'JOIN_LOBBY', payload: { room: { ...room, code }, player, players: room.players || [player] } });
    });

    socket.on('room:joined', ({ code, player, room }) => {
      setLoading(false);
      dispatch({ type: 'JOIN_LOBBY', payload: { room: { ...room, code }, player, players: room.players } });
    });

    socket.on('error', ({ message }) => {
      setLoading(false);
      setError(message);
    });

    return () => {
      socket.off('room:created');
      socket.off('room:joined');
      socket.off('error');
    };
  }, [socket]);

  const handleCreate = () => {
    if (!name.trim()) return setError(t('enterName'));
    if (!socket) return setError(t('connecting'));
    setLoading(true);
    setError('');
    socket.emit('room:create', { playerName: name.trim(), maxRounds: rounds });
  };

  const handleJoin = () => {
    if (!name.trim()) return setError(t('enterName'));
    if (!roomCode.trim()) return setError(t('enterCode'));
    if (!socket) return setError(t('connecting'));
    setLoading(true);
    setError('');
    socket.emit('room:join', { code: roomCode.trim().toUpperCase(), playerName: name.trim() });
  };

  const isRtl = language === 'ar';

  return (
    <div className="min-h-screen bg-dark-900 bg-grid relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* 3D Hero background */}
      <div className="absolute inset-0">
        <NeonHero />
      </div>

      {/* Radial glow */}
      <div className="absolute inset-0 bg-radial pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(191,0,255,0.08) 0%, transparent 70%)' }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          <h1 className="font-display text-7xl md:text-8xl font-black tracking-wider mb-2"
            style={{
              background: 'linear-gradient(135deg, #00f0ff, #bf00ff, #ff00aa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.5))',
            }}>
            {t('title')}
          </h1>
          <p className="font-mono text-sm tracking-widest uppercase"
            style={{ color: '#00f0ff80' }}>
            {t('subtitle')}
          </p>
          <div className="mt-3 h-px w-48 mx-auto"
            style={{ background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)' }} />
        </motion.div>

        {/* Mode selector or forms */}
        <AnimatePresence mode="wait">
          {!mode ? (
            <motion.div
              key="selector"
              className="neon-card p-8 space-y-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-center text-xl mb-6" style={{ color: '#e0e0ff' }}>
                {t('choosePath')}
              </h2>
              <button
                onClick={() => setMode('create')}
                className="btn-neon btn-neon-blue w-full text-sm py-4"
              >
                ⬡ {t('createRoom')}
              </button>
              <button
                onClick={() => setMode('join')}
                className="btn-neon btn-neon-purple w-full text-sm py-4"
              >
                ⬡ {t('joinRoom')}
              </button>
              <button
                onClick={() => window.location.href = '/leaderboard'}
                className="btn-neon btn-neon-pink w-full text-sm py-3 text-sm"
              >
                ◈ {t('leaderboard')}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="neon-card p-8 space-y-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => { setMode(null); setError(''); }}
                className={`font-mono text-xs opacity-40 hover:opacity-80 transition-opacity flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}
                style={{ color: '#00f0ff' }}
              >
                <span>{isRtl ? '→' : '←'}</span>
                <span>{t('back')}</span>
              </button>

              <h2 className="font-display text-lg" style={{ color: mode === 'create' ? '#00f0ff' : '#bf00ff' }}>
                {mode === 'create' ? `⬡ ${t('createRoom')}` : `⬡ ${t('joinRoom')}`}
              </h2>

              <input
                type="text"
                placeholder={t('yourName')}
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={16}
                className="neon-input font-display tracking-wider"
                onKeyDown={e => e.key === 'Enter' && (mode === 'create' ? handleCreate() : handleJoin())}
              />

              {mode === 'join' && (
                <input
                  type="text"
                  placeholder={t('roomCode')}
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="neon-input font-display tracking-widest text-center text-xl"
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                />
              )}

              {mode === 'create' && (
                <div>
                  <label className="font-mono text-xs opacity-50 mb-1 block">{t('rounds')}: {rounds}</label>
                  <input
                    type="range" min={3} max={10} value={rounds}
                    onChange={e => setRounds(Number(e.target.value))}
                    className="w-full accent-blue-400"
                  />
                </div>
              )}

              {error && (
                <motion.p
                  className="font-mono text-sm text-center"
                  style={{ color: '#ff00aa' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  ⚠ {t(error) || error}
                </motion.p>
              )}

              <button
                onClick={mode === 'create' ? handleCreate : handleJoin}
                disabled={loading}
                className={`btn-neon w-full py-4 text-sm ${mode === 'create' ? 'btn-neon-blue' : 'btn-neon-purple'}`}
              >
                {loading ? '...' : mode === 'create' ? t('launchRoom') : t('enterRoom')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center mt-6 font-mono text-xs opacity-20 uppercase">
          {t('subtitle')}
        </p>
      </div>

      {/* Developer Credit */}
      <motion.div
        className="fixed bottom-6 left-0 right-0 text-center z-20 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-20" style={{ color: '#00f0ff' }}>
          {t('createdBy')}
        </p>
      </motion.div>
    </div>
  );
}
