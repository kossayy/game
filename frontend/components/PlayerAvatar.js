import { motion } from 'framer-motion';

const COLORS = ['#00f0ff', '#bf00ff', '#ff00aa', '#00ff88', '#ffee00', '#ff6600'];

export default function PlayerAvatar({ player, size = 'md', showName = true, rank = null, glow = true }) {
  const idx = player.name ? player.name.charCodeAt(0) % COLORS.length : 0;
  const color = COLORS[idx];

  const sizes = {
    sm: { avatar: 32, text: 'text-xs', wrapper: 'gap-1' },
    md: { avatar: 48, text: 'text-sm', wrapper: 'gap-2' },
    lg: { avatar: 64, text: 'text-base', wrapper: 'gap-3' },
    xl: { avatar: 96, text: 'text-lg', wrapper: 'gap-3' },
  };

  const s = sizes[size];
  const initials = player.name ? player.name.slice(0, 2).toUpperCase() : '??';

  return (
    <motion.div
      className={`flex flex-col items-center ${s.wrapper}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative">
        {rank !== null && (
          <div
            className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold z-10"
            style={{ background: rank === 0 ? '#ffee00' : rank === 1 ? '#aaaaaa' : '#cd7f32', color: '#050508' }}
          >
            {rank + 1}
          </div>
        )}
        <div
          className="rounded-full flex items-center justify-center font-display font-bold relative overflow-hidden"
          style={{
            width: s.avatar,
            height: s.avatar,
            background: `linear-gradient(135deg, ${color}20, ${color}40)`,
            border: `2px solid ${color}`,
            boxShadow: glow ? `0 0 12px ${color}60, 0 0 24px ${color}30` : 'none',
            fontSize: s.avatar * 0.35,
            color: color,
          }}
        >
          {initials}
          <div
            className="absolute inset-0 opacity-10 rounded-full"
            style={{ background: `radial-gradient(circle at 30% 30%, white, transparent)` }}
          />
        </div>
        {player.connected === false && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-dark-900" />
        )}
      </div>
      {showName && (
        <span
          className={`font-body font-semibold ${s.text} truncate max-w-[80px]`}
          style={{ color: color }}
        >
          {player.name}
        </span>
      )}
    </motion.div>
  );
}
