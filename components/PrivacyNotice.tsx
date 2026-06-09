import React, { useState } from 'react';
import { Cookie, X } from 'lucide-react';

const DISMISS_KEY = 'lukaos-cookie-dismissed';

export const PrivacyNotice: React.FC = () => {
  // Persist dismissal so the notice doesn't reappear on every reload.
  const [isVisible, setIsVisible] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const dismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      /* storage unavailable (private mode/quota) — dismiss for this session only */
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[100] max-w-xs animate-in slide-in-from-bottom-8 fade-in duration-700">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/70 dark:border-white/10 shadow-panel rounded-panel p-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute -right-4 -top-4 text-zinc-100 dark:text-zinc-900 opacity-50 rotate-12 pointer-events-none">
            <Cookie size={100} strokeWidth={1} />
        </div>

        <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white">Cookie Policy</h4>
                </div>
                <button
                    onClick={dismiss}
                    className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                    aria-label="Dismiss cookie notice"
                >
                    <X size={14} />
                </button>
            </div>
            
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mb-4 leading-relaxed">
                This site uses <b className="text-black dark:text-white">0 tracking cookies</b>. 
                <br/>
                I ate them all. They were delicious. 🍪
            </p>

            <button
                onClick={dismiss}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
                Cronch (Dismiss)
            </button>
        </div>
      </div>
    </div>
  );
};