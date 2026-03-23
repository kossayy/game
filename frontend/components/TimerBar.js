import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function TimerBar({ seconds, maxSeconds, phase }) {
  const { t } = useLanguage();
  const pct = maxSeconds > 0 ? (seconds / maxSeconds) * 100 : 0;
  const isUrgent = pct < 25;
  const isCritical = pct < 10;

  const color = isCritical
    ? '#ff00aa'
    : isUrgent
    ? '#ffee00'
    : pct > 60
    ? '#00f0ff'
    : '#bf00ff';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-xs opacity-50 uppercase tracking-widest">{phase}</span>
        <motion.span
          className="font-display text-sm font-bold"
          style={{ color }}
          animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {seconds}{t('secondsShort')}
        </motion.span>
      </div>
      <div className="w-full h-1 bg-dark-600 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
            boxShadow: `0 0 8px ${color}`,
            width: `${pct}%`,
          }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
