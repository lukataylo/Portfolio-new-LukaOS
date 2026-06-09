/**
 * Mobile Tab Bar Component
 *
 * iOS-style bottom tab bar shown on mobile instead of the macOS dock.
 * Five large, labeled targets with the two contact actions (LinkedIn, Email)
 * tinted in the accent colour. Everything else lives in the app drawer,
 * opened via the Apps tab.
 *
 * @module components/MobileTabBar
 */

import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { DOCK_ITEMS } from '../constants';
import { DesktopItem } from '../types';

interface MobileTabBarProps {
  /** Opens the app drawer (Apps tab). */
  onAppsClick: () => void;
  /** Opens a dock item (window or external link). */
  onItemClick: (item: DesktopItem) => void;
  /** Item ids with an open window — used for the active dot. */
  openItemIds: string[];
}

// Tabs surfaced directly in the bar; accent marks the contact actions.
const TAB_IDS: Array<{ id: string; label: string; accent: boolean }> = [
  { id: 'blog-dock', label: 'Notes', accent: false },
  { id: 'terminal', label: 'Terminal', accent: false },
  { id: 'linkedin', label: 'LinkedIn', accent: true },
  { id: 'email', label: 'Email', accent: true },
];

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  onAppsClick,
  onItemClick,
  openItemIds,
}) => {
  const tabs = TAB_IDS.map(tab => ({
    ...tab,
    item: DOCK_ITEMS.find(i => i.id === tab.id),
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

        {tabs.map(({ id, label, accent, item }) => {
          const Icon = item.icon;
          const isOpen = openItemIds.includes(item.appId ?? item.id);
          const tint = accent
            ? 'text-red-600 dark:text-red-500'
            : 'text-zinc-500 dark:text-zinc-400';

          return (
            <button
              key={id}
              onClick={() => onItemClick(item)}
              className="relative flex-1 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
              aria-label={`Open ${label}${isOpen ? ' (running)' : ''}`}
            >
              <Icon size={20} className={tint} strokeWidth={accent ? 2 : 1.75} />
              <span className={`text-[10px] leading-none ${tint} ${accent ? 'font-semibold' : ''}`}>
                {label}
              </span>
              {isOpen && (
                <span className="absolute top-1 right-1/2 translate-x-4 w-1 h-1 rounded-full bg-red-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
