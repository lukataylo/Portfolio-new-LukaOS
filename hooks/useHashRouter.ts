import { useEffect, useRef } from 'react';
import { DESKTOP_ITEMS, DOCK_ITEMS } from '../constants';
import type { DesktopItem, WindowState } from '../types';

const BASE_TITLE = 'Luka Dadiani | Product Manager & Senior Designer';

interface HashRouterArgs {
  /** Currently focused window id (null when desktop is focused). */
  activeWindowId: string | null;
  /** Open windows. Used to look up the active window's item. */
  windows: WindowState[];
  /** Open or focus an item — invoked when the URL maps to a known route. */
  onOpenItem: (item: DesktopItem) => void;
}

/**
 * Hash-based router + per-route SEO meta sync.
 *
 * 1. On first paint, opens the window matching `window.location.hash` (or the
 *    About Me presentation if no hash).
 * 2. Whenever the active window changes, mirrors its slug to the URL hash and
 *    rewrites `<title>` + `<meta name="description">` so deep links and share
 *    previews show the right content.
 *
 * Encapsulated as a hook so callers don't have to thread two effects through
 * the root component.
 */
export const useHashRouter = ({ activeWindowId, windows, onOpenItem }: HashRouterArgs) => {
  // Captured synchronously: the meta-sync effect below rewrites the URL on
  // mount (no active window yet), which would wipe the deep link before the
  // open timer reads it.
  const initialHash = useRef(typeof window !== 'undefined' ? window.location.hash : '');
  // The hash is only cleared when the user closes their last window — never
  // on mount, where it would destroy the incoming deep link.
  const hadActiveWindow = useRef(false);

  // Initial hash → open
  useEffect(() => {
    const openHash = (hash: string) => {
      if (!hash) {
        const aboutMe = DESKTOP_ITEMS.find((i) => i.id === 'about-me');
        if (aboutMe) onOpenItem(aboutMe);
        return;
      }

      const route = hash.replace('#/', '');
      const target = [...DESKTOP_ITEMS, ...DOCK_ITEMS].find(
        (i) => i.slug === route || i.id === route || (route.startsWith('blog/') && i.id === 'blog'),
      );
      if (target) onOpenItem(target);
    };

    // Delay one tick so the rest of mount completes before we trigger window-open animations.
    const id = setTimeout(() => openHash(initialHash.current), 100);
    // Keep responding to back/forward navigation and manual hash edits.
    const onHashChange = () => openHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      clearTimeout(id);
      window.removeEventListener('hashchange', onHashChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Active window → URL hash + document meta
  useEffect(() => {
    const activeWindow = windows.find((w) => w.id === activeWindowId);
    if (!activeWindow) {
      document.title = BASE_TITLE;
      if (hadActiveWindow.current) {
        window.history.replaceState(null, '', ' ');
      }
      return;
    }
    hadActiveWindow.current = true;

    const item = [...DESKTOP_ITEMS, ...DOCK_ITEMS].find((i) => i.id === activeWindow.itemId);
    if (!item) return;

    document.title = `${item.title} | Luka Dadiani`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && item.seoDescription) {
      metaDesc.setAttribute('content', item.seoDescription);
    }

    const newHash = `#/${item.slug || item.id}`;
    if (window.location.hash !== newHash && !window.location.hash.includes(item.id + '/')) {
      window.history.replaceState(null, '', newHash);
    }
  }, [activeWindowId, windows]);
};
