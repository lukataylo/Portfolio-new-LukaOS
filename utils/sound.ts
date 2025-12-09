/**
 * Sound Utilities for LukaOS
 *
 * Provides Web Audio API-based sound effects for UI interactions.
 * All sounds are generated programmatically using oscillators.
 *
 * @module utils/sound
 */

/** Available sound effect types */
export type SoundType = 'pop' | 'close' | 'minimize' | 'notification' | 'click';

/** Audio context singleton for better performance */
let audioContext: AudioContext | null = null;

/**
 * Gets or creates the audio context singleton.
 * Uses lazy initialization to avoid creating context before user interaction.
 */
const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioContext;
};

/**
 * Plays a UI sound effect using the Web Audio API.
 *
 * @param type - The type of sound to play
 * @param enabled - Whether sound is enabled (defaults to true)
 *
 * @example
 * ```ts
 * // Play a pop sound when opening a window
 * playSound('pop');
 *
 * // Conditionally play based on user preference
 * playSound('notification', soundEnabled);
 * ```
 */
export const playSound = (type: SoundType, enabled: boolean = true): void => {
  if (!enabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'pop':
        // Quick upward chirp - used for opening windows, interactions
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case 'close':
        // Downward sweep - used for closing windows
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        break;

      case 'minimize':
        // Soft descending tone - used for minimizing windows
        oscillator.frequency.setValueAtTime(500, now);
        oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gainNode.gain.setValueAtTime(0.06, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case 'notification':
        // Two-tone chime - used for notifications
        oscillator.frequency.setValueAtTime(880, now);
        oscillator.frequency.setValueAtTime(1100, now + 0.1);
        oscillator.frequency.setValueAtTime(880, now + 0.2);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;

      case 'click':
        // Short click - used for button presses
        oscillator.frequency.setValueAtTime(1000, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
        break;
    }
  } catch {
    // Silently fail if audio not supported
  }
};
