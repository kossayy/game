import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function Countdown({ onDone }) {
  const { t } = useLanguage();
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) { onDone?.(); return; }
    const t = setTimeout(() => setCount(c => c - 1), 900);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          {count > 0 ? (
            <div
              className="font-display text-[12rem] font-black leading-none"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #bf00ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 40px rgba(0,240,255,0.8))',
              }}
            >
              {count}
            </div>
          ) : (
            <div
              className="font-display text-6xl font-black uppercase"
              style={{
                background: 'linear-gradient(135deg, #00ff88, #00f0ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 40px rgba(0,255,136,0.8))',
              }}
            >
              {t('go')}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
