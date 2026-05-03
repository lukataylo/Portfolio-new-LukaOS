import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { MenuBarClock } from './MenuBarClock';

describe('<MenuBarClock />', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T13:42:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a time string', () => {
    render(<MenuBarClock />);
    const button = screen.getByRole('button');
    expect(button.textContent).toMatch(/\d{1,2}:\d{2}/);
  });

  it('cycles modes on click and emits the label', () => {
    const onCycle = vi.fn();
    render(<MenuBarClock onCycleMode={onCycle} />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(onCycle).toHaveBeenLastCalledWith(expect.stringContaining('Binary'));
    expect(button.textContent).toMatch(/^[01]+:[01]+$/);

    fireEvent.click(button);
    expect(onCycle).toHaveBeenLastCalledWith(expect.stringContaining('Hex'));
    expect(button.textContent).toMatch(/^0x/);

    fireEvent.click(button);
    expect(onCycle).toHaveBeenLastCalledWith(expect.stringContaining('coffee'));
    expect(button.textContent).toBe('☕:☕☕');

    fireEvent.click(button);
    // 4th click resets — does not emit
    expect(onCycle).toHaveBeenCalledTimes(3);
  });

  it('updates every second', () => {
    render(<MenuBarClock />);
    const button = screen.getByRole('button');
    const before = button.textContent;
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(button.textContent).not.toBe(before);
  });
});
