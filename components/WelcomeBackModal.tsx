import React from 'react';
import { Coffee, ArrowRight } from 'lucide-react';

interface WelcomeBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  awayDuration: number; // in minutes
}

export const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({
  isOpen,
  onClose,
  awayDuration
}) => {
  if (!isOpen) return null;

  const getTimeAwayText = () => {
    if (awayDuration < 1) return 'a moment';
    if (awayDuration < 60) return `${Math.round(awayDuration)} minute${awayDuration >= 2 ? 's' : ''}`;
    const hours = Math.floor(awayDuration / 60);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const getMessage = () => {
    if (awayDuration < 5) return "Quick break?";
    if (awayDuration < 30) return "Welcome back!";
    if (awayDuration < 60) return "Good to see you again!";
    return "It's been a while!";
  };

  const getSubMessage = () => {
    if (awayDuration < 5) return "Hope you grabbed some coffee.";
    if (awayDuration < 30) return "Ready to continue exploring?";
    if (awayDuration < 60) return "Your windows are right where you left them.";
    return "I kept everything running for you.";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[301] p-4">
        <div
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full overflow-hidden animate-in zoom-in-95 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with icon */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coffee className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold tracking-wide">{getMessage()}</h2>
            <p className="text-white/80 text-sm mt-1">{getSubMessage()}</p>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-1">
              You were away for
            </p>
            <p className="text-2xl font-bold text-black dark:text-white mb-4">
              {getTimeAwayText()}
            </p>

            <button
              onClick={onClose}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group"
            >
              Continue
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 pb-4">
            <p className="text-[10px] text-zinc-400 text-center uppercase tracking-widest">
              LukaOS • Session Active
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
