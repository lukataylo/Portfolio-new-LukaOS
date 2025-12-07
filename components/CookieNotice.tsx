import React, { useState } from 'react';
import { Cookie, X } from 'lucide-react';

export const CookieNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[100] max-w-xs animate-in slide-in-from-bottom-8 fade-in duration-700">
      <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-lg p-4 relative overflow-hidden">
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
                    onClick={() => setIsVisible(false)}
                    className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
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
                onClick={() => setIsVisible(false)}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
                Cronch (Dismiss)
            </button>
        </div>
      </div>
    </div>
  );
};