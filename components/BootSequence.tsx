import React, { useEffect, useState } from 'react';

const BOOT_FLAG = 'lukaos-booted-v1';
const DURATION_MS = 700;

interface BootSequenceProps {
  /** Force the boot sequence to render (e.g. for testing). */
  force?: boolean;
}

/**
 * Brief boot sequence shown to first-time visitors. Skipped on:
 *  - returning visitors (localStorage flag)
 *  - prefers-reduced-motion users
 *  - SSR (no window)
 */
export const BootSequence: React.FC<BootSequenceProps> = ({ force }) => {
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (force) return true;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    try {
      return !window.localStorage.getItem(BOOT_FLAG);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!show) return;
    try {
      window.localStorage.setItem(BOOT_FLAG, '1');
    } catch {
      /* ignore quota errors */
    }
    const id = window.setTimeout(() => setShow(false), DURATION_MS);
    return () => window.clearTimeout(id);
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black flex items-center justify-center pointer-events-none"
      style={{ zIndex: 1100, animation: `bootFade ${DURATION_MS}ms ease-out forwards` }}
      aria-hidden="true"
    >
      <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
      <style>{`
        @keyframes bootFade {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
