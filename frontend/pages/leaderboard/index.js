import { useEffect, useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import PlayerAvatar from '../../components/PlayerAvatar';
import dynamic from 'next/dynamic';
import { useLanguage } from '../../context/LanguageContext';

const NeonHero = dynamic(() => import('../../components/NeonHero'), { ssr: false });

const RANK_COLORS = ['#ffee00', '#aaaaaa', '#cd7f32'];

export default function LeaderboardPage() {
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    fetch(`${url}/api/leaderboard`)
      .then(r => r.json())
      .then(data => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const isRtl = language === 'ar';

  return (
    <>
      <Head><title>{t('title')} — {t('leaderboard')}</title></Head>
      <div className="min-h-screen bg-dark-900 bg-grid relative overflow-hidden flex flex-col items-center justify-start pt-10 p-4">
        <div className="absolute inset-0 opacity-30 pointer-events-none"><NeonHero /></div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(255,238,0,0.06) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 w-full max-w-lg">
          <motion.div className="text-center mb-8"
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h1
              className="font-display text-5xl font-black mb-2 uppercase"
              style={{
                background: 'linear-gradient(135deg, #ffee00, #ff00aa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('leaderboard')}
            </h1>
            <p className="font-mono text-xs tracking-widest opacity-30 uppercase">{t('allTimeTop')}</p>
          </motion.div>

          {loading ? (
            <motion.div className="text-center font-mono opacity-30 uppercase"
              animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
              {t('loading')}
            </motion.div>
          ) : entries.length === 0 ? (
            <div className="neon-card p-8 text-center uppercase">
              <p className="font-mono text-sm opacity-40">{t('noScores')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.07 }}
                  className="neon-card p-4 flex items-center gap-4"
                  style={{
                    borderColor: i === 0 ? '#ffee0040' : undefined,
                    background: i === 0 ? 'linear-gradient(135deg, rgba(255,238,0,0.06), transparent)' : undefined,
                  }}
                >
                  <span className="font-display text-lg font-bold w-10 text-center flex-shrink-0"
                    style={{ color: RANK_COLORS[i] || '#e0e0ff40' }}>
                    {i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}`}
                  </span>
                  <PlayerAvatar
                    player={{ name: entry.playerName }}
                    size="sm" showName={false}
                    glow={i < 3}
                  />
                  <div className="flex-1 min-w-0 text-left rtl:text-right">
                    <div className="font-display font-bold truncate"
                      style={{ color: RANK_COLORS[i] || '#e0e0ff' }}>
                      {entry.playerName}
                    </div>
                    <div className="font-mono text-xs opacity-30">
                      {new Date(entry.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </div>
                  </div>
                  <div className="font-display text-2xl font-black flex-shrink-0"
                    style={{ color: RANK_COLORS[i] || '#e0e0ff' }}>
                    {entry.score}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.button
            onClick={() => window.location.href = '/'}
            className="btn-neon btn-neon-blue w-full mt-8 py-4 uppercase flex items-center justify-center gap-2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.01 }}
          >
            <span>{isRtl ? '→' : '←'}</span>
            <span>{t('backToHome')}</span>
          </motion.button>
        </div>
      </div>
    </>
  );
}
