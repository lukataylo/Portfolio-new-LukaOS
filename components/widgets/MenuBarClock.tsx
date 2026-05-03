import React, { useEffect, useState } from 'react';

type ClockMode = 'normal' | 'binary' | 'hex' | 'coffee';

interface MenuBarClockProps {
  onCycleMode?: (label: string) => void;
}

/**
 * Owns its own 1Hz tick so the rest of the app does not re-render every second.
 * Clicking cycles through display modes (Easter egg).
 */
export const MenuBarClock: React.FC<MenuBarClockProps> = ({ onCycleMode }) => {
  const [time, setTime] = useState(() => new Date());
  const [mode, setMode] = useState<ClockMode>('normal');
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleClick = () => {
    const next = clicks + 1;
    setClicks(next);
    if (next >= 4) {
      setClicks(0);
      setMode('normal');
    } else if (next === 1) {
      setMode('binary');
      onCycleMode?.('🤖 Binary time activated');
    } else if (next === 2) {
      setMode('hex');
      onCycleMode?.('💻 Hex time activated');
    } else if (next === 3) {
      setMode('coffee');
      onCycleMode?.("☕ It's always coffee time");
    }
  };

  const formatted = (() => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    switch (mode) {
      case 'binary':
        return `${hours.toString(2).padStart(5, '0')}:${minutes.toString(2).padStart(6, '0')}`;
      case 'hex':
        return `0x${hours.toString(16).toUpperCase()}:${minutes.toString(16).toUpperCase().padStart(2, '0')}`;
      case 'coffee':
        return '☕:☕☕';
      default:
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  })();

  return (
    <button
      onClick={handleClick}
      className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono cursor-pointer hover:text-black dark:hover:text-white transition-colors ml-1"
      title="Click to change time format"
      aria-label={`Current time ${formatted}. Click to cycle display modes.`}
    >
      {formatted}
    </button>
  );
};
