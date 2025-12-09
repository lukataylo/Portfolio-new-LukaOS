/**
 * Keyboard Shortcuts Hook
 *
 * Provides keyboard shortcut handling for the desktop environment.
 * Supports window management, Spotlight, and Easter eggs.
 *
 * @module hooks/useKeyboardShortcuts
 */

import { useEffect, useCallback, useRef } from 'react';

/** Configuration for keyboard shortcuts */
export interface KeyboardShortcutsConfig {
  /** Callback when Cmd+W is pressed (close window) */
  onCloseWindow?: () => void;
  /** Callback when Cmd+M is pressed (minimize window) */
  onMinimizeWindow?: () => void;
  /** Callback when Cmd+Q is pressed (quit - usually shows fun message) */
  onQuit?: () => void;
  /** Callback when Cmd+Tab is pressed (app switcher) */
  onAppSwitch?: () => void;
  /** Callback when Cmd+Space is pressed (spotlight) */
  onSpotlight?: () => void;
  /** Callback when Escape is pressed */
  onEscape?: () => void;
  /** Callback when Konami code is completed */
  onKonami?: () => void;
  /** Whether shortcuts are enabled */
  enabled?: boolean;
}

/**
 * Custom hook for handling keyboard shortcuts.
 *
 * @param config - Configuration object with callbacks
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   onCloseWindow: () => closeWindow(activeWindowId),
 *   onMinimizeWindow: () => minimizeWindow(activeWindowId),
 *   onSpotlight: () => setIsSpotlightOpen(true),
 *   onKonami: () => activateRetroMode(),
 * });
 * ```
 */
export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig): void => {
  const {
    onCloseWindow,
    onMinimizeWindow,
    onQuit,
    onAppSwitch,
    onSpotlight,
    onEscape,
    onKonami,
    enabled = true,
  } = config;

  // Konami code tracking
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  const konamiIndex = useRef(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Skip if user is typing in an input
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Konami code check (works even in input fields)
      if (e.code === konamiCode[konamiIndex.current]) {
        konamiIndex.current++;
        if (konamiIndex.current === konamiCode.length) {
          onKonami?.();
          konamiIndex.current = 0;
        }
      } else {
        konamiIndex.current = 0;
      }

      // Skip other shortcuts if in input field
      if (isInputField && e.key !== 'Escape') return;

      const isMod = e.metaKey || e.ctrlKey;

      // Cmd+Space - Spotlight
      if (isMod && e.code === 'Space') {
        e.preventDefault();
        onSpotlight?.();
        return;
      }

      // Cmd+W - Close window
      if (isMod && e.key === 'w') {
        e.preventDefault();
        onCloseWindow?.();
        return;
      }

      // Cmd+M - Minimize window
      if (isMod && e.key === 'm') {
        e.preventDefault();
        onMinimizeWindow?.();
        return;
      }

      // Cmd+Q - Quit (fun message)
      if (isMod && e.key === 'q') {
        e.preventDefault();
        onQuit?.();
        return;
      }

      // Cmd+Tab - App switcher
      if (isMod && e.key === 'Tab') {
        e.preventDefault();
        onAppSwitch?.();
        return;
      }

      // Escape
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
    },
    [enabled, onCloseWindow, onMinimizeWindow, onQuit, onAppSwitch, onSpotlight, onEscape, onKonami]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

/**
 * Hook for handling app switcher key release (when Cmd/Ctrl is released).
 *
 * @param isActive - Whether app switcher is currently active
 * @param onRelease - Callback when modifier key is released
 */
export const useAppSwitcherRelease = (
  isActive: boolean,
  onRelease: () => void
): void => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'Control') {
        onRelease();
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [isActive, onRelease]);
};
