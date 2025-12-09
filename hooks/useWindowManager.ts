/**
 * Window Manager Hook
 *
 * Provides centralized window state management for the desktop environment.
 * Handles window creation, positioning, z-index stacking, and lifecycle.
 *
 * @module hooks/useWindowManager
 */

import { useState, useCallback } from 'react';
import { WindowState, DesktopItem, FileType, WindowRect } from '../types';
import { DESKTOP_ITEMS, INITIAL_WINDOW_WIDTH, INITIAL_WINDOW_HEIGHT } from '../constants';

/** Return type for the useWindowManager hook */
export interface WindowManagerReturn {
  /** Array of all window states */
  windows: WindowState[];
  /** ID of the currently active (focused) window */
  activeWindowId: string | null;
  /** Opens an item in a new window or focuses existing window */
  openWindow: (item: DesktopItem, sourceRect?: WindowRect) => void;
  /** Closes a window by ID */
  closeWindow: (id: string) => void;
  /** Minimizes a window to the dock */
  minimizeWindow: (id: string) => void;
  /** Toggles window maximize state */
  maximizeWindow: (id: string) => void;
  /** Moves a window to a new position */
  moveWindow: (id: string, x: number, y: number) => void;
  /** Resizes a window */
  resizeWindow: (id: string, width: number, height: number) => void;
  /** Brings a window to the front (highest z-index) */
  bringToFront: (id: string) => void;
  /** Returns array of open item IDs */
  getOpenItemIds: () => string[];
}

/**
 * Custom hook for managing window state in the desktop environment.
 *
 * @returns WindowManagerReturn object with state and methods
 *
 * @example
 * ```tsx
 * const { windows, openWindow, closeWindow } = useWindowManager();
 *
 * // Open a window from a desktop item
 * openWindow(desktopItem, sourceRect);
 *
 * // Close by ID
 * closeWindow('window-about-me');
 * ```
 */
export const useWindowManager = (): WindowManagerReturn => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  /**
   * Brings a window to the front by setting highest z-index
   */
  const bringToFront = useCallback((id: string) => {
    setActiveWindowId(id);
    setWindows((prev) => {
      const maxZ = prev.length > 0 ? Math.max(10, ...prev.map((w) => w.zIndex)) : 10;
      return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
    });
  }, []);

  /**
   * Opens an item in a window or focuses existing window
   */
  const openWindow = useCallback(
    (item: DesktopItem, sourceRect?: WindowRect) => {
      // Handle external links - open directly in new tab
      if (item.type === FileType.EXTERNAL_LINK && item.url) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
        return;
      }

      // Normalize target ID for apps
      let targetId = item.id;
      if (item.type === FileType.APP && item.appId) {
        targetId = item.appId === 'ai-chat' ? 'ai-chat' : item.appId === 'blog' ? 'blog' : item.appId;
      }

      // Check for existing window
      const existingWindow = windows.find((w) => w.itemId === targetId);
      if (existingWindow) {
        if (existingWindow.isMinimized) {
          setWindows((prev) =>
            prev.map((w) => (w.id === existingWindow.id ? { ...w, isMinimized: false } : w))
          );
        }
        bringToFront(existingWindow.id);
        return;
      }

      // Resolve actual item for APP types
      let realItem = item;
      if (item.type === FileType.APP && item.appId) {
        if (item.appId === 'ai-chat') {
          realItem = { ...item, type: FileType.APP, id: 'ai-chat', title: 'System_AI_Assistant' };
        } else {
          const target = DESKTOP_ITEMS.find((i) => i.id === item.appId);
          if (target) realItem = target;
        }
      }

      // Calculate dimensions based on device and content type
      const isMobile = window.innerWidth < 768;
      let initialWidth = INITIAL_WINDOW_WIDTH;
      let initialHeight = INITIAL_WINDOW_HEIGHT;

      if (isMobile) {
        initialWidth = window.innerWidth - 32;
        initialHeight = window.innerHeight - 100;
      } else {
        // Type-specific sizing
        const sizeMap: Partial<Record<FileType, { width: number; height: number }>> = {
          [FileType.LINK]: { width: 800, height: 600 },
          [FileType.BLOG]: { width: 900, height: 700 },
          [FileType.SITEMAP]: { width: 700, height: 600 },
        };
        const customSize = sizeMap[realItem.type];
        if (customSize) {
          initialWidth = customSize.width;
          initialHeight = customSize.height;
        }
      }

      // Calculate position with cascading
      let startX = isMobile ? 16 : 100;
      let startY = isMobile ? 16 : 100;

      if (!isMobile) {
        const activeWindow = windows.find((w) => w.id === activeWindowId);
        if (activeWindow && !activeWindow.isMinimized) {
          startX = activeWindow.position.x + 30;
          startY = activeWindow.position.y + 30;

          // Boundary check
          if (startX + initialWidth > window.innerWidth - 50) startX = 50;
          if (startY + initialHeight > window.innerHeight - 50) startY = 50;
        } else {
          // Default cascade
          startX = 100 + windows.length * 30;
          startY = 100 + windows.length * 30;

          // Wrap around
          if (startX > window.innerWidth / 2) startX = 100;
          if (startY > window.innerHeight / 2) startY = 100;
        }
      }

      // Calculate z-index
      const maxZ = windows.length > 0 ? Math.max(10, ...windows.map((w) => w.zIndex)) : 10;

      const newWindow: WindowState = {
        id: `window-${realItem.id}`,
        itemId: realItem.id,
        title: realItem.title,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: maxZ + 1,
        position: { x: startX, y: startY },
        size: { width: initialWidth, height: initialHeight },
        originRect: sourceRect,
      };

      setWindows((prev) => [...prev, newWindow]);
      setActiveWindowId(newWindow.id);
    },
    [windows, activeWindowId, bringToFront]
  );

  /**
   * Closes a window and focuses the next available window
   */
  const closeWindow = useCallback(
    (id: string) => {
      setWindows((prev) => prev.filter((w) => w.id !== id));
      setActiveWindowId((prev) => {
        if (prev === id) {
          const remaining = windows.filter((w) => w.id !== id && !w.isMinimized);
          return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
        }
        return prev;
      });
    },
    [windows]
  );

  /**
   * Minimizes a window to the dock
   */
  const minimizeWindow = useCallback(
    (id: string) => {
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)));
      const remaining = windows.filter((w) => w.id !== id && !w.isMinimized);
      setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    },
    [windows]
  );

  /**
   * Toggles window maximize state
   */
  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)));
  }, []);

  /**
   * Moves a window to new coordinates
   */
  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, position: { x, y } } : w)));
  }, []);

  /**
   * Resizes a window
   */
  const resizeWindow = useCallback((id: string, width: number, height: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, size: { width, height } } : w)));
  }, []);

  /**
   * Returns IDs of all open items
   */
  const getOpenItemIds = useCallback((): string[] => {
    return windows.map((w) => w.itemId);
  }, [windows]);

  return {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    moveWindow,
    resizeWindow,
    bringToFront,
    getOpenItemIds,
  };
};
