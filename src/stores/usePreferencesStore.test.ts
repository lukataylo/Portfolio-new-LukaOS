import { describe, it, expect, beforeEach } from 'vitest';
import { usePreferencesStore } from './usePreferencesStore';

describe('usePreferencesStore', () => {
  beforeEach(() => {
    usePreferencesStore.setState({
      theme: 'light',
      soundEnabled: true,
      reduceMotion: false,
    });
  });

  it('toggles theme', () => {
    usePreferencesStore.getState().toggleTheme();
    expect(usePreferencesStore.getState().theme).toBe('dark');
    usePreferencesStore.getState().toggleTheme();
    expect(usePreferencesStore.getState().theme).toBe('light');
  });

  it('sets sound preference', () => {
    usePreferencesStore.getState().setSoundEnabled(false);
    expect(usePreferencesStore.getState().soundEnabled).toBe(false);
  });

  it('sets reduce-motion preference', () => {
    usePreferencesStore.getState().setReduceMotion(true);
    expect(usePreferencesStore.getState().reduceMotion).toBe(true);
  });
});
