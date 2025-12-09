/**
 * App Switcher Component
 *
 * macOS-style Cmd+Tab application switcher overlay.
 * Shows all non-minimized windows with icons for quick switching.
 *
 * @module components/layout/AppSwitcher
 */

import React from 'react';
import { WindowState, DesktopItem } from '../../types';

/** Props for the AppSwitcher component */
export interface AppSwitcherProps {
  /** Whether the app switcher is visible */
  isOpen: boolean;
  /** Array of all windows */
  windows: WindowState[];
  /** Currently selected index in the switcher */
  selectedIndex: number;
  /** Array of all items (desktop + dock) for icon lookup */
  allItems: DesktopItem[];
}

/**
 * App Switcher overlay for switching between open windows.
 * Activated via Cmd+Tab, cycles through with Tab, switches on modifier release.
 *
 * @example
 * ```tsx
 * <AppSwitcher
 *   isOpen={isAppSwitcherOpen}
 *   windows={windows}
 *   selectedIndex={appSwitcherIndex}
 *   allItems={[...DESKTOP_ITEMS, ...DOCK_ITEMS]}
 * />
 * ```
 */
export const AppSwitcher: React.FC<AppSwitcherProps> = ({
  isOpen,
  windows,
  selectedIndex,
  allItems,
}) => {
  if (!isOpen) return null;

  const openWindows = windows.filter((w) => !w.isMinimized);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200]" />

      {/* Switcher Panel */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-2xl p-4">
          <div className="flex items-center gap-4">
            {openWindows.map((win, index) => {
              const item = allItems.find((i) => i.id === win.itemId);
              const Icon = item?.icon;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={win.id}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                    isSelected ? 'bg-blue-500 scale-110' : 'bg-zinc-100 dark:bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-white/20' : 'bg-white dark:bg-zinc-700'
                    }`}
                  >
                    {Icon && (
                      <Icon
                        size={28}
                        className={isSelected ? 'text-white' : 'text-black dark:text-white'}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium truncate max-w-[80px] ${
                      isSelected ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {win.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Instructions */}
          <p className="text-center text-[10px] text-zinc-400 mt-3">
            Release &#8984; to switch
          </p>
        </div>
      </div>
    </>
  );
};
