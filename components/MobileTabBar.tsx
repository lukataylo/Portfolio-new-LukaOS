/**
 * Mobile Tab Bar Component
 *
 * iOS-style bottom tab bar shown on mobile instead of the macOS dock.
 * The currently selected (foreground) app is tinted red; every other tab is
 * grey. LinkedIn + GitHub also live above the fold in the menu bar, so this
 * bar focuses on navigation.
 *
 * @module components/MobileTabBar
 */

import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { DESKTOP_ITEMS, DOCK_ITEMS } from '../constants';
import { DesktopItem } from '../types';

interface MobileTabBarProps {
  /** Opens the app drawer (Apps tab). */
  onAppsClick: () => void;
  /** Opens a dock item (window or external link). */
  onItemClick: (item: DesktopItem) => void;
  /** Item ids with an open window — used for the "running" dot. */
  openItemIds: string[];
  /** Item id of the foreground window — rendered in red as the selected tab. */
  activeItemId: string | null;
}

// Tabs surfaced directly in the bar, in order.
const TAB_IDS: Array<{ id: string; label: string }> = [
  { id: 'about-me', label: 'About' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'email', label: 'Email' },
];

// About Me lives on the desktop, not in the dock — look both up.
const ALL_ITEMS = [...DOCK_ITEMS, ...DESKTOP_ITEMS];

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  onAppsClick,
  onItemClick,
  openItemIds,
  activeItemId,
}) => {
  const tabs = TAB_IDS.map(tab => ({
    ...tab,
    item: ALL_ITEMS.find(i => i.id === tab.id),
  })).filter((tab): tab is typeof tab & { item: DesktopItem } => Boolean(tab.item));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[120] md:hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-black/5 dark:border-white/10 pb-safe"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around h-14">
        <button
          onClick={onAppsClick}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
          aria-label="All apps"
        >
          <LayoutGrid size={20} className="text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
          <span className="text-[10px] leading-none text-zinc-500 dark:text-zinc-400">Apps</span>
        </button>

        {tabs.map(({ id, label, item }) => {
          const Icon = item.icon;
          const itemKey = item.appId ?? item.id;
          const isActive = activeItemId === itemKey;
          const isOpen = openItemIds.includes(itemKey);
          // Selected (foreground) tab is red; everything else is grey.
          const tint = isActive
            ? 'text-red-600 dark:text-red-500'
            : 'text-zinc-500 dark:text-zinc-400';

          return (
            <button
              key={id}
              onClick={() => onItemClick(item)}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex-1 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
              aria-label={`Open ${label}${isActive ? ' (selected)' : isOpen ? ' (running)' : ''}`}
            >
              <Icon size={20} className={tint} strokeWidth={isActive ? 2 : 1.75} />
              <span className={`text-[10px] leading-none ${tint} ${isActive ? 'font-semibold' : ''}`}>
                {label}
              </span>
              {isOpen && !isActive && (
                <span className="absolute top-1 right-1/2 translate-x-4 w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
