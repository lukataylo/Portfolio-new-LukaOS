import { describe, it, expect } from 'vitest';
import { MENU_BAR_H, DOCK_H, MOBILE_DOCK_H, SNAP_THRESHOLD, WINDOW_MIN_W, WINDOW_MIN_H } from './layout';
import { Z } from './zIndex';

describe('layout constants', () => {
  it('exports positive heights', () => {
    expect(MENU_BAR_H).toBeGreaterThan(0);
    expect(DOCK_H).toBeGreaterThan(0);
    expect(MOBILE_DOCK_H).toBeGreaterThanOrEqual(DOCK_H);
  });

  it('snap threshold is reasonable', () => {
    expect(SNAP_THRESHOLD).toBeGreaterThanOrEqual(20);
    expect(SNAP_THRESHOLD).toBeLessThanOrEqual(60);
  });

  it('window min size respects iPhone SE', () => {
    expect(WINDOW_MIN_W).toBeLessThanOrEqual(375);
    expect(WINDOW_MIN_H).toBeLessThanOrEqual(667);
  });
});

describe('z-index scale', () => {
  it('layers strictly increase', () => {
    const values = Object.values(Z);
    const sorted = [...values].sort((a, b) => a - b);
    expect(values).toEqual(sorted);
  });

  it('drag ghost beats every other layer', () => {
    const others = Object.entries(Z).filter(([k]) => k !== 'dragGhost').map(([, v]) => v);
    expect(Z.dragGhost).toBeGreaterThan(Math.max(...others));
  });
});
