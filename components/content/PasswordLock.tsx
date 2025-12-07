import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface PasswordLockProps {
  correctPassword?: string;
  isUnlocked: boolean;
  onUnlock: () => void;
  children?: React.ReactNode;
}

export const PasswordLock: React.FC<PasswordLockProps> = ({ correctPassword, isUnlocked, onUnlock, children }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === correctPassword) {
      onUnlock();
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 1000);
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-zinc-100 dark:bg-zinc-950 transition-colors">
      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Lock className="text-white w-8 h-8" />
      </div>
      
      <h3 className="text-black dark:text-white uppercase tracking-widest text-lg font-bold mb-2">Restricted Access</h3>
      <p className="text-zinc-500 text-xs mb-8 text-center max-w-xs font-mono">
        This case study is protected by NDA. Please enter your access code.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs">
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ENTER PASSWORD"
          className={`
            w-full bg-white dark:bg-zinc-900 border-2 rounded px-4 py-3 text-center text-black dark:text-white tracking-[0.5em] outline-none font-mono
            transition-colors focus:border-red-600
            ${error ? 'border-red-600 animate-bounce' : 'border-zinc-300 dark:border-zinc-800'}
          `}
          autoFocus
        />
        <button 
          type="submit"
          className="bg-black dark:bg-white text-white dark:text-black font-bold uppercase py-3 rounded hover:opacity-80 transition-opacity tracking-widest text-xs"
        >
          Decrypt
        </button>
      </form>
    </div>
  );
};