/**
 * Clock Widget Component
 *
 * Displays current time with date in a desktop widget style.
 *
 * @module components/widgets/ClockWidget
 */

import React, { useState, useEffect } from 'react';

export const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const formatTime = (n: number) => n.toString().padStart(2, '0');

  const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-lg w-48">
      {/* Time */}
      <div className="text-center">
        <div className="text-4xl font-bold text-black dark:text-white font-mono tracking-tight">
          {formatTime(hours)}:{formatTime(minutes)}
        </div>
        <div className="text-lg text-zinc-400 font-mono">
          :{formatTime(seconds)}
        </div>
      </div>

      {/* Date */}
      <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            {dayName}
          </div>
          <div className="text-sm text-black dark:text-white mt-0.5">
            {monthDay}
          </div>
        </div>
      </div>
    </div>
  );
};
