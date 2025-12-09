/**
 * LocalStorage Persistence Utilities
 *
 * Provides type-safe localStorage operations for persisting app state.
 * Handles serialization, deserialization, and storage errors gracefully.
 *
 * @module utils/storage
 */

/** Storage keys used by the application */
export const STORAGE_KEYS = {
  THEME: 'lukaos-theme',
  SOUND_ENABLED: 'lukaos-sound',
  DESKTOP_ICON_POSITIONS: 'lukaos-desktop-positions',
  WINDOW_STATES: 'lukaos-windows',
  REDUCE_MOTION: 'lukaos-reduce-motion',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Safely retrieves and parses a value from localStorage.
 *
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist or parse fails
 * @returns Parsed value or default
 */
export function getStorageItem<T>(key: StorageKey, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely stores a value in localStorage.
 *
 * @param key - Storage key
 * @param value - Value to store (will be JSON serialized)
 */
export function setStorageItem<T>(key: StorageKey, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Storage full or disabled - fail silently
    console.warn('Failed to save to localStorage:', e);
  }
}

/**
 * Removes an item from localStorage.
 *
 * @param key - Storage key to remove
 */
export function removeStorageItem(key: StorageKey): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch {
    // Fail silently
  }
}

/** Desktop icon position data */
export interface IconPosition {
  id: string;
  x: number;
  y: number;
}

/** Saved window state (subset of full WindowState) */
export interface SavedWindowState {
  itemId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMaximized: boolean;
}

/**
 * Saves desktop icon positions to localStorage.
 */
export function saveIconPositions(positions: IconPosition[]): void {
  setStorageItem(STORAGE_KEYS.DESKTOP_ICON_POSITIONS, positions);
}

/**
 * Loads desktop icon positions from localStorage.
 */
export function loadIconPositions(): IconPosition[] {
  return getStorageItem<IconPosition[]>(STORAGE_KEYS.DESKTOP_ICON_POSITIONS, []);
}

/**
 * Saves theme preference to localStorage.
 */
export function saveTheme(theme: 'light' | 'dark'): void {
  setStorageItem(STORAGE_KEYS.THEME, theme);
}

/**
 * Loads theme preference from localStorage.
 * Also checks system preference as fallback.
 */
export function loadTheme(): 'light' | 'dark' {
  const saved = getStorageItem<'light' | 'dark' | null>(STORAGE_KEYS.THEME, null);
  if (saved) return saved;

  // Check system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return 'light';
}

/**
 * Saves sound enabled preference.
 */
export function saveSoundEnabled(enabled: boolean): void {
  setStorageItem(STORAGE_KEYS.SOUND_ENABLED, enabled);
}

/**
 * Loads sound enabled preference.
 */
export function loadSoundEnabled(): boolean {
  return getStorageItem<boolean>(STORAGE_KEYS.SOUND_ENABLED, true);
}

/**
 * Saves reduce motion preference.
 */
export function saveReduceMotion(enabled: boolean): void {
  setStorageItem(STORAGE_KEYS.REDUCE_MOTION, enabled);
}

/**
 * Loads reduce motion preference.
 * Also checks system preference as fallback.
 */
export function loadReduceMotion(): boolean {
  const saved = getStorageItem<boolean | null>(STORAGE_KEYS.REDUCE_MOTION, null);
  if (saved !== null) return saved;

  // Check system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  return false;
}
