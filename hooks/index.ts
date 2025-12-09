/**
 * Custom Hooks Index
 *
 * Re-exports all custom hooks for convenient importing.
 *
 * @module hooks
 */

export { useWindowManager } from './useWindowManager';
export type { WindowManagerReturn } from './useWindowManager';

export { useKeyboardShortcuts, useAppSwitcherRelease } from './useKeyboardShortcuts';
export type { KeyboardShortcutsConfig } from './useKeyboardShortcuts';
