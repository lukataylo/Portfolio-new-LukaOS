import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Transient toast/banner state. `flash(text, ms?)` shows a message and
 * automatically clears it. Pending timers are cancelled on each new flash and
 * on unmount, so messages never collide and callbacks never fire post-unmount.
 */
export const useFunMessage = (defaultMs = 3000) => {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setMessage(null);
  }, []);

  const flash = useCallback(
    (text: string, ms: number = defaultMs) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(text);
      timer.current = setTimeout(() => {
        setMessage(null);
        timer.current = null;
      }, ms);
    },
    [defaultMs],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { message, flash, clear } as const;
};
