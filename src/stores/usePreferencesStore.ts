import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface PreferencesState {
  theme: Theme;
  soundEnabled: boolean;
  reduceMotion: boolean;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setSoundEnabled: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
}

const prefersDark =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: prefersDark ? 'dark' : 'light',
      soundEnabled: true,
      reduceMotion: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    {
      name: 'lukaos-preferences',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
