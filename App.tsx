import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { ALL_ITEMS, DESKTOP_ITEMS, DOCK_ITEMS, FINDER_ITEMS, SEARCHABLE_ITEMS, INITIAL_WINDOW_HEIGHT, INITIAL_WINDOW_WIDTH } from './constants';
import { DesktopItem, WindowState, FileType, ChatMessage, WindowRect } from './types';
import { DesktopIcon } from './components/DesktopIcon';
import { Dock } from './components/Dock';
import { WindowFrame } from './components/window/WindowFrame';
// Eagerly imported (small / always needed):
import { PasswordLock } from './components/content/PasswordLock';
import { SkeletonLoader } from './components/content/SkeletonLoader';
// Lazy-loaded content apps — each ships in its own chunk and only downloads on demand.
const PresentationViewer = lazy(() => import('./components/content/PresentationViewer').then(m => ({ default: m.PresentationViewer })));
const ChatApp = lazy(() => import('./components/content/ChatApp').then(m => ({ default: m.ChatApp })));
const BrowserApp = lazy(() => import('./components/content/BrowserApp').then(m => ({ default: m.BrowserApp })));
const BlogApp = lazy(() => import('./components/content/BlogApp').then(m => ({ default: m.BlogApp })));
const TerminalApp = lazy(() => import('./components/content/TerminalApp').then(m => ({ default: m.TerminalApp })));
const MailCompose = lazy(() => import('./components/content/MailCompose').then(m => ({ default: m.MailCompose })));
const SitemapViewer = lazy(() => import('./components/content/SitemapViewer').then(m => ({ default: m.SitemapViewer })));
const FinderApp = lazy(() => import('./components/content/FinderApp').then(m => ({ default: m.FinderApp })));
const SystemPreferences = lazy(() => import('./components/content/SystemPreferences').then(m => ({ default: m.SystemPreferences })));
const ContentEditorApp = lazy(() => import('./components/content/ContentEditorApp').then(m => ({ default: m.ContentEditorApp })));
import { ContextMenu } from './components/ContextMenu';
import { SocialLinks } from './components/SocialLinks';
import { Spotlight } from './components/Spotlight';
import { MobileAppDrawer } from './components/MobileAppDrawer';
import { MobileTabBar } from './components/MobileTabBar';
import { AppSwitcher } from './components/layout/AppSwitcher';
import { NotificationCenter } from './components/layout/NotificationCenter';
import { ClockWidget, WeatherWidget, GitHubWidget, MenuBarClock } from './components/widgets';
import { Sun, Moon, Search, Volume2, VolumeX, Bell, Settings } from 'lucide-react';
// Gemini SDK is dynamically imported on first use to keep the initial bundle small.
import { loadTheme, saveTheme, loadSoundEnabled, saveSoundEnabled, loadReduceMotion, saveReduceMotion, loadIconPositions, saveIconPositions, IconPosition } from './utils/storage';
import { playSound as playSoundFx, type SoundType } from './utils/sound';
import { useAdmin } from './contexts/AdminContext';
import { useContent } from './hooks/useContent';
import { useFunMessage } from './hooks/useFunMessage';
import { useHashRouter } from './hooks/useHashRouter';
import { MENU_BAR_H, DOCK_H, SNAP_THRESHOLD } from './src/constants/layout';

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme());

  // Admin mode
  const { isAdminMode, isAuthenticated } = useAdmin();

  // Content management (CMS) — presentations only. Notes/blog posts are
  // sourced from MDX files in `src/content/notes/`.
  const {
    desktopItems: managedDesktopItems,
    isLoaded: contentLoaded,
    saveContent,
    updateDesktopItem,
    updateSlide,
    addSlide,
    deleteSlide,
    resetToDefaults
  } = useContent();

  // Desktop Items State (for sorting and positioning) - use managed items when loaded
  const [desktopItems, setDesktopItems] = useState<DesktopItem[]>(DESKTOP_ITEMS);

  // Sync managed desktop items when content is loaded
  useEffect(() => {
    if (contentLoaded) {
      setDesktopItems(managedDesktopItems);
    }
  }, [contentLoaded, managedDesktopItems]);
  const [iconPositions, setIconPositions] = useState<IconPosition[]>(() => loadIconPositions());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Drag & Drop state
  const [draggingIconId, setDraggingIconId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragCurrentPos, setDragCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [hasDraggedEnough, setHasDraggedEnough] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);
  const DRAG_THRESHOLD = 5; // Minimum pixels to move before considering it a drag

  // Reduce motion preference
  const [reduceMotion, setReduceMotion] = useState(() => loadReduceMotion());

  // Widget visibility
  const [showWidgets, setShowWidgets] = useState(true);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Menu Bar Dropdown State
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { message: funMessage, flash: flashFunMessage } = useFunMessage();
  // Closing the dropdown is part of every fun-message trigger from the menu bar.
  const flashAndCloseMenu = useCallback(
    (text: string, ms?: number) => {
      flashFunMessage(text, ms ?? 3000);
      setActiveMenu(null);
    },
    [flashFunMessage],
  );

  // Spotlight State
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // App Switcher State (Cmd+Tab)
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);
  const [appSwitcherIndex, setAppSwitcherIndex] = useState(0);

  // Notification Center State
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; time: Date }>>([]);

  // Sound State
  const [soundEnabled, setSoundEnabled] = useState(() => loadSoundEnabled());

  // Mobile App Drawer State
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Easter Egg States
  const [konamiActivated, setKonamiActivated] = useState(false);

  // Lifted States
  const [unlockedItemIds, setUnlockedItemIds] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'System online. Ask me about the case studies or about Luka.' }
  ]);

  // Persist theme changes
  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  // Persist sound preference
  useEffect(() => {
    saveSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // Persist reduce motion preference
  useEffect(() => {
    saveReduceMotion(reduceMotion);
  }, [reduceMotion]);

  // Persist icon positions
  useEffect(() => {
    if (iconPositions.length > 0) {
      saveIconPositions(iconPositions);
    }
  }, [iconPositions]);

  // Get saved icon position
  const getIconPosition = useCallback((itemId: string): { x: number; y: number } | null => {
    const saved = iconPositions.find(p => p.id === itemId);
    if (saved) return { x: saved.x, y: saved.y };
    return null;
  }, [iconPositions]);

  // Desktop drag handlers
  const handleIconDragStart = useCallback((itemId: string, clientX: number, clientY: number, iconRect: DOMRect) => {
    setDraggingIconId(itemId);
    setDragOffset({
      x: clientX - iconRect.left,
      y: clientY - iconRect.top
    });
    setDragCurrentPos({ x: clientX, y: clientY });
    setDragStartPos({ x: clientX, y: clientY });
    setHasDraggedEnough(false);
  }, []);

  const handleIconDragEnd = useCallback(() => {
    // Only save position if we actually dragged (moved past threshold)
    if (!desktopRef.current || !draggingIconId || !dragCurrentPos || !hasDraggedEnough) {
      setDraggingIconId(null);
      setDragCurrentPos(null);
      setDragStartPos(null);
      setHasDraggedEnough(false);
      return;
    }

    const desktopRect = desktopRef.current.getBoundingClientRect();
    const gridSize = 100; // Snap to 100px grid

    // Calculate position relative to desktop
    let x = dragCurrentPos.x - desktopRect.left - dragOffset.x;
    let y = dragCurrentPos.y - desktopRect.top - dragOffset.y;

    // Snap to grid
    x = Math.round(x / gridSize) * gridSize;
    y = Math.round(y / gridSize) * gridSize;

    // Constrain to desktop bounds
    x = Math.max(0, Math.min(x, desktopRect.width - 112));
    y = Math.max(0, Math.min(y, desktopRect.height - 100));

    // Update positions
    setIconPositions(prev => {
      const existing = prev.filter(p => p.id !== draggingIconId);
      return [...existing, { id: draggingIconId, x, y }];
    });

    setDraggingIconId(null);
    setDragCurrentPos(null);
    setDragStartPos(null);
    setHasDraggedEnough(false);
  }, [draggingIconId, dragCurrentPos, dragOffset, hasDraggedEnough]);

  // Stable refs for drag state — avoids re-binding listeners on every mousemove.
  const handleIconDragEndRef = useRef(handleIconDragEnd);
  handleIconDragEndRef.current = handleIconDragEnd;
  const dragStartPosRef = useRef(dragStartPos);
  dragStartPosRef.current = dragStartPos;
  const hasDraggedEnoughRef = useRef(hasDraggedEnough);
  hasDraggedEnoughRef.current = hasDraggedEnough;

  // Track mouse/touch movement during icon drag.
  // Listeners attach once per drag session and use refs internally so we don't churn.
  useEffect(() => {
    if (!draggingIconId) return;

    let rafId: number | null = null;
    let pendingPos: { x: number; y: number } | null = null;

    const flush = () => {
      rafId = null;
      if (!pendingPos) return;
      const newPos = pendingPos;
      pendingPos = null;
      setDragCurrentPos(newPos);

      const start = dragStartPosRef.current;
      if (!start || hasDraggedEnoughRef.current) return;
      const dx = Math.abs(newPos.x - start.x);
      const dy = Math.abs(newPos.y - start.y);
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        setHasDraggedEnough(true);
      }
    };

    const queue = (x: number, y: number) => {
      pendingPos = { x, y };
      if (rafId === null) rafId = requestAnimationFrame(flush);
    };

    const handleMouseMove = (e: MouseEvent) => queue(e.clientX, e.clientY);

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      if (e.cancelable) e.preventDefault();
      queue(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleMouseUp = () => handleIconDragEndRef.current();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [draggingIconId]);

  // Konami Code Easter Egg (↑↑↓↓←→←→BA)
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let konamiIndex = 0;

    const handleKonami = (e: KeyboardEvent) => {
      if (e.code === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          setKonamiActivated(true);
          flashFunMessage('🎮 KONAMI CODE ACTIVATED! Retro mode enabled!');
          // Reset after 10 seconds
          setTimeout(() => setKonamiActivated(false), 10000);
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKonami);
    return () => window.removeEventListener('keydown', handleKonami);
  }, []);

  // Clock state moved into <MenuBarClock> so the rest of the app does not re-render every second.

  // Spotlight keyboard shortcut (Cmd+Space or Ctrl+Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keyboard shortcuts for window management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Cmd+W - Close active window
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        if (activeWindowId) {
          playSound('close');
          closeWindow(activeWindowId);
        }
      }

      // Cmd+M - Minimize active window
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault();
        if (activeWindowId) {
          playSound('minimize');
          minimizeWindow(activeWindowId);
        }
      }

      // Cmd+Q - Quit (fun message)
      if ((e.metaKey || e.ctrlKey) && e.key === 'q') {
        e.preventDefault();
        flashFunMessage('Quit blocked: portfolio still running.');
      }

      // Cmd+Tab - App Switcher
      if ((e.metaKey || e.ctrlKey) && e.key === 'Tab') {
        e.preventDefault();
        const openWindows = windows.filter(w => !w.isMinimized);
        if (openWindows.length > 1) {
          if (!isAppSwitcherOpen) {
            setIsAppSwitcherOpen(true);
            setAppSwitcherIndex(0);
            playSound('pop');
          } else {
            // Cycle through windows
            setAppSwitcherIndex(prev => (prev + 1) % openWindows.length);
          }
        }
      }

      // Escape - Close app switcher or spotlight
      if (e.key === 'Escape') {
        if (isAppSwitcherOpen) {
          setIsAppSwitcherOpen(false);
        } else if (isSpotlightOpen) {
          setIsSpotlightOpen(false);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // When Cmd/Ctrl is released, switch to selected window
      if ((e.key === 'Meta' || e.key === 'Control') && isAppSwitcherOpen) {
        const openWindows = windows.filter(w => !w.isMinimized);
        if (openWindows[appSwitcherIndex]) {
          bringToFront(openWindows[appSwitcherIndex].id);
        }
        setIsAppSwitcherOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeWindowId, windows, isAppSwitcherOpen, appSwitcherIndex, isSpotlightOpen]);

  const playSound = useCallback((type: SoundType) => playSoundFx(type, soundEnabled), [soundEnabled]);

  // Add welcome notification on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification('Welcome to LukaOS', 'Press ⌘ Space to search, or double-click any icon.');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Admin mode - open/close Content Editor window
  useEffect(() => {
    const editorWindowId = 'window-content-editor';
    const existingEditor = windows.find(w => w.id === editorWindowId);

    if (isAdminMode && !existingEditor) {
      // Open the Content Editor window
      const maxZ = windows.length > 0 ? Math.max(10, ...windows.map(w => w.zIndex)) : 10;
      const newWindow: WindowState = {
        id: editorWindowId,
        itemId: 'content-editor',
        title: 'Content_Editor',
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: maxZ + 1,
        position: { x: 100, y: 100 },
        size: { width: 900, height: 650 }
      };
      setWindows(prev => [...prev, newWindow]);
      setActiveWindowId(editorWindowId);
    } else if (!isAdminMode && existingEditor) {
      // Close the Content Editor window
      setWindows(prev => prev.filter(w => w.id !== editorWindowId));
      if (activeWindowId === editorWindowId) {
        const remaining = windows.filter(w => w.id !== editorWindowId && !w.isMinimized);
        setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
      }
    }
  }, [isAdminMode]);

  // Add notification helper
  const addNotification = (title: string, message: string) => {
    const newNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      time: new Date()
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Keep max 10
    playSound('notification');
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useHashRouter({ activeWindowId, windows, onOpenItem: (item) => handleOpenItem(item) });

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const sortByName = () => {
    setDesktopItems(prev => [...prev].sort((a, b) => a.title.localeCompare(b.title)));
  };

  const sortByType = () => {
    setDesktopItems(prev => [...prev].sort((a, b) => a.type.localeCompare(b.type)));
  };

  const refreshDesktop = () => {
    setIsRefreshing(true);
    setContextMenu(null);
    setTimeout(() => {
        setDesktopItems(DESKTOP_ITEMS); // Reset to default order or just re-render
        setIsRefreshing(false);
    }, 500);
  };

  const cleanUpIcons = () => {
    setIconPositions([]); // Clear all saved positions
    setContextMenu(null);
    // Also clear from localStorage
    localStorage.removeItem('lukaos-icon-positions');
  };

  const handleChatSend = async (text: string) => {
      // Optimistic update
      const newMsg: ChatMessage = { role: 'user', text };
      setChatMessages(prev => [...prev, newMsg]);

      // Get history
      const history = chatMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`);
      
      // Call Service (lazy-loaded so the Gemini SDK ships in its own chunk)
      const { generateChatResponse } = await import('./services/geminiService');
      const responseText = await generateChatResponse(history, text);
      
      setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
  };

  const bringToFront = (id: string) => {
    setActiveWindowId(id);
    setWindows(prev => {
      // Renormalize z-indexes into a compact 10..n band so repeated focusing
      // never pushes windows above the fixed chrome (menu bar, dock, overlays).
      const ordered = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const zOf = new Map(ordered.map((w, i) => [w.id, 10 + i]));
      return prev.map(w => ({ ...w, zIndex: w.id === id ? 10 + prev.length : zOf.get(w.id)! }));
    });
  };

  const handleOpenItem = (item: DesktopItem, sourceRect?: WindowRect) => {
    // Handle external links - open directly in new tab
    if (item.type === FileType.EXTERNAL_LINK && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Logic to find if window already exists
    let targetId = item.id;
    if (item.type === FileType.APP && item.appId) {
        if (item.appId === 'ai-chat') {
            targetId = 'ai-chat'; // Normalize ID for chat
        } else if (item.appId === 'blog') {
            targetId = 'blog';
        } else {
            targetId = item.appId;
        }
    }

    const existingWindow = windows.find(w => w.itemId === targetId);
    if (existingWindow) {
      // Revive a window caught mid-close, or restore one that's minimized.
      if (existingWindow.isClosing || existingWindow.isMinimized) {
        setWindows(prev => prev.map(w =>
          w.id === existingWindow.id ? { ...w, isClosing: false, isMinimized: false } : w
        ));
      }
      bringToFront(existingWindow.id);
      return;
    }

    // Create new window
    let realItem = item;
    // Map App shortcuts to real items
    if (item.type === FileType.APP && item.appId) {
        if (item.appId === 'ai-chat') {
             realItem = { ...item, type: FileType.APP, id: 'ai-chat', title: 'System_AI_Assistant' };
        } else {
             const target = DESKTOP_ITEMS.find(i => i.id === item.appId);
             if (target) realItem = target;
        }
    }

    // Determine initial size based on type and screen size
    const isMobile = window.innerWidth < 768;
    const MENU_BAR_HEIGHT = 36;
    let initialWidth = INITIAL_WINDOW_WIDTH;
    let initialHeight = INITIAL_WINDOW_HEIGHT;

    if (isMobile) {
        initialWidth = window.innerWidth - 32;
        // Account for menu bar at top and the tab bar (56px + safe area) at bottom
        initialHeight = window.innerHeight - MENU_BAR_HEIGHT - 12 - 72;
    } else if (realItem.id === 'about-me') {
        // About Me presentation gets a larger window for better readability
        initialWidth = 800;
        initialHeight = 650;
    } else if (realItem.type === FileType.LINK) {
        // Links (Browser) get slightly larger default window
        initialWidth = 800;
        initialHeight = 600;
    } else if (realItem.type === FileType.BLOG) {
        // Blog Reader gets a reader-friendly aspect ratio
        initialWidth = 900;
        initialHeight = 700;
    } else if (realItem.type === FileType.SITEMAP) {
        initialWidth = 700;
        initialHeight = 600;
    }

    // Calculate Position: Cascade from active window OR default diagonal
    // On mobile, start below the menu bar
    let startX = isMobile ? 16 : 100;
    let startY = isMobile ? MENU_BAR_HEIGHT + 12 : 100;
    
    // Find active window to cascade from
    const activeWindow = windows.find(w => w.id === activeWindowId);
    if (!isMobile && activeWindow && !activeWindow.isMinimized) {
        startX = activeWindow.position.x + 30;
        startY = activeWindow.position.y + 30;
        
        // Boundary check - prevent going off screen bottom/right too much
        if (startX + initialWidth > window.innerWidth - 50) startX = 50;
        if (startY + initialHeight > window.innerHeight - 50) startY = 50;
    } else if (!isMobile) {
        // Default cascade if no active window
        startX = 100 + (windows.length * 30);
        startY = 100 + (windows.length * 30);
        
        // Wrap around if too deep
        if (startX > window.innerWidth / 2) startX = 100;
        if (startY > window.innerHeight / 2) startY = 100;
    }

    // Calculate proper Z-Index (Above everything else)
    const maxZ = windows.length > 0 ? Math.max(10, ...windows.map(w => w.zIndex)) : 10;
    const newZIndex = maxZ + 1;

    const newWindow: WindowState = {
      id: `window-${realItem.id}`,
      itemId: realItem.id,
      title: realItem.title,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: newZIndex, 
      position: { 
        x: startX, 
        y: startY 
      },
      size: { width: initialWidth, height: initialHeight },
      originRect: sourceRect
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
  };

  // The visually topmost of the remaining windows, by z-index (array order is
  // insertion order, which says nothing about stacking).
  const topmostWindowId = (excludeId: string): string | null => {
    const remaining = windows.filter(w => w.id !== excludeId && !w.isMinimized);
    if (remaining.length === 0) return null;
    return remaining.reduce((top, w) => (w.zIndex > top.zIndex ? w : top)).id;
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    setActiveWindowId(prev => (prev === id ? topmostWindowId(id) : prev));
  };

  // Marks a window as closing the instant its animation begins, so a re-open
  // during the ~260ms close can revive it rather than focus a dying frame.
  const startClosingWindow = (id: string) => {
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, isClosing: true } : w)));
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    setActiveWindowId(topmostWindowId(id));
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  };

  // Window tiling - snap to edges
  const handleWindowSnapCheck = useCallback((id: string, x: number, y: number) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - MENU_BAR_H - DOCK_H;

    // Left edge - snap to left half
    if (x <= SNAP_THRESHOLD) {
      return { x: 0, y: MENU_BAR_H, width: screenWidth / 2, height: screenHeight };
    }
    // Right edge - snap to right half
    if (x >= screenWidth - SNAP_THRESHOLD) {
      return { x: screenWidth / 2, y: MENU_BAR_H, width: screenWidth / 2, height: screenHeight };
    }
    // Top edge - maximize
    if (y <= SNAP_THRESHOLD + MENU_BAR_H) {
      return { x: 0, y: MENU_BAR_H, width: screenWidth, height: screenHeight };
    }

    return null;
  }, []);

  const moveWindow = (id: string, x: number, y: number, shouldSnap?: boolean) => {
    if (shouldSnap) {
      const snapResult = handleWindowSnapCheck(id, x, y);
      if (snapResult) {
        // Save pre-snap state before snapping
        setWindows(prev => prev.map(w => {
          if (w.id !== id) return w;

          // Only save preSnapRect if not already snapped
          const preSnapRect = w.isSnapped ? w.preSnapRect : {
            x: w.position.x,
            y: w.position.y,
            width: w.size.width,
            height: w.size.height
          };

          return {
            ...w,
            position: { x: snapResult.x, y: snapResult.y },
            size: { width: snapResult.width, height: snapResult.height },
            isMaximized: snapResult.width === window.innerWidth,
            isSnapped: true,
            preSnapRect
          };
        }));
        return;
      } else {
        // Dragging away from snap zone - restore previous size if was snapped
        setWindows(prev => prev.map(w => {
          if (w.id !== id) return w;

          if (w.isSnapped && w.preSnapRect) {
            // Restore to pre-snap size, but position at cursor
            return {
              ...w,
              position: { x: x - w.preSnapRect.width / 2, y },
              size: { width: w.preSnapRect.width, height: w.preSnapRect.height },
              isMaximized: false,
              isSnapped: false,
              preSnapRect: undefined
            };
          }

          return { ...w, position: { x, y } };
        }));
        return;
      }
    }

    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, position: { x, y } } : w
    ));
  };

  const resizeWindow = (id: string, width: number, height: number) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, size: { width, height } } : w
    ));
  };

  const getOpenItemIds = (): string[] => {
    return windows.map(w => w.itemId);
  };

  // The foreground (active, non-minimized) window's item id. Drives the
  // "selected nav item is red, everything else grey" treatment in the tab bar.
  const activeItemId =
    windows.find(w => w.id === activeWindowId && !w.isMinimized)?.itemId ?? null;

  /**
   * Renders an app's content for a window (interactive) or a dock preview
   * (inert: callbacks are no-ops so hover previews can't mutate state).
   */
  const renderAppContent = (itemId: string, interactive: boolean) => {
    const item = [...desktopItems, ...DOCK_ITEMS].find(i => i.id === itemId);
    const noop = () => {};

    // Handle AI Chat App
    if (itemId === 'ai-chat') {
      return <ChatApp messages={chatMessages} onSendMessage={interactive ? handleChatSend : async () => {}} />;
    }

    // Handle Content Editor (admin mode)
    if (itemId === 'content-editor') {
      return (
        <ContentEditorApp
          desktopItems={desktopItems}
          onUpdateDesktopItem={updateDesktopItem}
          onUpdateSlide={updateSlide}
          onAddSlide={addSlide}
          onDeleteSlide={deleteSlide}
          onSave={saveContent}
          onReset={resetToDefaults}
        />
      );
    }

    if (!item) return <div className="p-4">Content not found</div>;

    switch (item.type) {
      case FileType.PRESENTATION:
        return <PresentationViewer slides={item.content || []} />;
      case FileType.PROTECTED: {
        const isUnlocked = unlockedItemIds.includes(item.id);
        if (isUnlocked && item.lockedContent) {
          return <PresentationViewer slides={item.lockedContent} />;
        }
        return (
          <PasswordLock
            correctPassword={item.password || ''}
            onUnlock={interactive ? () => setUnlockedItemIds((prev) => [...prev, item.id]) : noop}
          />
        );
      }
      case FileType.LINK:
        return <BrowserApp initialUrl={item.url || ''} />;
      case FileType.BLOG:
        return <BlogApp />;
      case FileType.TERMINAL:
        return <TerminalApp />;
      case FileType.MAIL:
        return <MailCompose recipientEmail="luka.taylor@gmail.com" recipientName="Luka Dadiani" />;
      case FileType.SITEMAP:
        return (
          <SitemapViewer
            onNavigate={interactive ? (id) => {
              const target = ALL_ITEMS.find((i) => i.id === id);
              if (target) handleOpenItem(target);
            } : noop}
          />
        );
      case FileType.FINDER:
        return (
          <FinderApp
            items={FINDER_ITEMS}
            onItemClick={interactive ? handleOpenItem : noop}
          />
        );
      case FileType.PREFERENCES:
        return (
          <SystemPreferences
            theme={theme}
            onThemeChange={interactive ? setTheme : noop}
            soundEnabled={soundEnabled}
            onSoundChange={interactive ? setSoundEnabled : noop}
            reduceMotion={reduceMotion}
            onReduceMotionChange={interactive ? setReduceMotion : noop}
            onPlaySound={interactive ? playSound : undefined}
          />
        );
      default:
        return <div className="p-4">Unknown content type</div>;
    }
  };


  // Menu bar dropdowns — easter-egg menus that keep the OS conceit honest.
  type MenuEntry = { label: string; onClick: () => void; danger?: boolean } | 'divider';
  const menuBarMenus: Array<{ id: string; label: string; items: MenuEntry[] }> = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New File', onClick: () => flashAndCloseMenu('touch: read-only file system.') },
        {
          label: 'Open About_Me.pdf',
          onClick: () => {
            const aboutMe = DESKTOP_ITEMS.find(item => item.id === 'about-me');
            if (aboutMe) handleOpenItem(aboutMe);
            setActiveMenu(null);
          },
        },
        { label: 'Save', onClick: () => flashAndCloseMenu('Already saved. State persists in localStorage.') },
        'divider',
        { label: 'Quit (Nice Try)', onClick: () => flashAndCloseMenu("Process 'portfolio' is not responding. Keep anyway?"), danger: true },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Undo', onClick: () => flashAndCloseMenu('Nothing to undo. Every decision here was deliberate.') },
        { label: 'Redo', onClick: () => flashAndCloseMenu('Redo stack empty.') },
        'divider',
        { label: 'Copy Contact', onClick: () => { navigator.clipboard.writeText('Luka Dadiani — Product Manager & Senior Designer'); flashAndCloseMenu('Copied to clipboard.'); } },
        { label: 'Select All', onClick: () => flashAndCloseMenu("Selected everything. You're welcome.") },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: 'Zoom In (Dramatically)', onClick: () => { document.body.style.transform = 'scale(1.5)'; setTimeout(() => { document.body.style.transform = ''; }, 500); flashAndCloseMenu('ZOOMING IN!', 2000); } },
        { label: 'Zoom Out (Quietly)', onClick: () => { document.body.style.transform = 'scale(0.8)'; setTimeout(() => { document.body.style.transform = ''; }, 500); flashAndCloseMenu('zooming out...', 2000); } },
        'divider',
        { label: 'Do a Barrel Roll', onClick: () => { document.body.style.transition = 'transform 1s'; document.body.style.transform = 'rotate(360deg)'; setTimeout(() => { document.body.style.transform = ''; document.body.style.transition = ''; }, 1000); flashAndCloseMenu('Wheeeee!', 2000); } },
        { label: 'Toggle Dimension', onClick: () => { toggleTheme(); flashAndCloseMenu(theme === 'light' ? 'Welcome to the dark side!' : 'Let there be light!'); } },
        { label: 'Enter Full Screen', onClick: () => flashAndCloseMenu('Your browser reserves that one. Try F11.') },
      ],
    },
  ];

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} ${reduceMotion ? 'motion-reduce' : ''}`}>
      {/* Skip Navigation Link for Accessibility */}
      <a
        href="#main-desktop"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[1000] focus:px-4 focus:py-2 focus:bg-red-600 focus:text-white focus:rounded focus:outline-none"
      >
        Skip to main content
      </a>

      <div
        className={`min-h-screen relative overflow-hidden bg-[#f0f0f0] dark:bg-[#0f0f0f] transition-colors duration-300 ${konamiActivated ? 'konami-retro' : ''}`}
        onContextMenu={handleContextMenu}
        onClick={() => setContextMenu(null)}
      >
        {/* Dot Grid Pattern */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle, ${theme === 'dark' ? '#fff' : '#000'} 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />
        </div>

        {/* Menu Bar */}
        <header className="fixed top-0 left-0 right-0 h-9 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 flex items-center justify-between px-4 z-50 transition-colors">
          <div className="flex items-center gap-4">
            {/* LukaOS Menu (Apple-style) */}
            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setActiveMenu(activeMenu === 'about' ? null : 'about')}
              >
                <div className={`w-3 h-3 bg-red-600 rounded-full transition-transform ${activeMenu === 'about' ? 'scale-125' : ''}`} />
                <span className={`font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${activeMenu === 'about' ? 'text-red-600' : 'text-black dark:text-white'}`}>
                  LukaOS
                </span>
              </div>
              {activeMenu === 'about' && (
                <div className="absolute top-8 left-0 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-2xl shadow-panel p-0 w-[320px] max-w-[calc(100vw-1rem)] max-h-[calc(100dvh-3rem)] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Header */}
                  <div className="p-4 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border-b border-black/5 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-sm">
                        <div className="w-4 h-4 bg-red-600 rounded-full" />
                      </div>
                      <div>
                        <h3 className="font-bold text-black dark:text-white text-sm">LukaOS</h3>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Version 1.0.0</p>
                      </div>
                    </div>
                  </div>

                  {/* About Me */}
                  <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">About</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      Hi, I'm <span className="font-bold text-black dark:text-white">Luka Dadiani</span> — a Product Manager & Senior Designer based in London with 9+ years of experience building user-centred digital products.
                    </p>
                  </div>

                  {/* Why This Site */}
                  <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Why This Design?</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-2">
                      Every portfolio looks the same. But doing something <em>different</em> often means worse UX.
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      Good UX is <span className="font-bold text-black dark:text-white">immediately recognisable</span>. This site uses a familiar metaphor — the desktop OS — to stand out while remaining intuitive.
                    </p>
                  </div>

                  {/* Inspiration */}
                  <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Inspired By</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300">macOS</span>
                      <span className="text-[10px] px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300">Nothing Phone</span>
                      <span className="text-[10px] px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300">PostHog</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        const prefsItem = DOCK_ITEMS.find(item => item.id === 'preferences');
                        if (prefsItem) {
                          handleOpenItem(prefsItem);
                        }
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-black dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors group text-left"
                    >
                      <Settings size={16} className="text-zinc-400 group-hover:text-red-600 transition-colors" />
                      <span className="text-xs font-medium">System Preferences...</span>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-[9px] text-zinc-400 text-center">
                      Built with React + TypeScript + Tailwind
                    </p>
                  </div>
                </div>
              )}
            </div>
            <nav className="hidden md:flex gap-4 ml-8 relative">
              {menuBarMenus.map((menu) => (
                <div key={menu.id} className="relative">
                  <span
                    onClick={() => setActiveMenu(activeMenu === menu.id ? null : menu.id)}
                    className={`font-mono text-[11px] font-medium uppercase tracking-[0.18em] cursor-pointer transition-colors ${activeMenu === menu.id ? 'text-red-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'}`}
                  >
                    {menu.label}
                  </span>
                  {activeMenu === menu.id && (
                    <div className="absolute top-6 left-0 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-xl shadow-panel p-1 min-w-[180px] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {menu.items.map((entry, i) =>
                        entry === 'divider' ? (
                          <div key={`divider-${i}`} className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                        ) : (
                          <button
                            key={entry.label}
                            onClick={entry.onClick}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors ${entry.danger ? 'text-red-500' : ''}`}
                          >
                            {entry.label}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {/* Always-visible LinkedIn + GitHub links (above the fold) */}
            <SocialLinks />
            <span className="hidden sm:block w-px h-4 bg-black/10 dark:bg-white/10" aria-hidden="true" />
            {/* Fun Message Toast */}
            {funMessage && (
              <span className="hidden sm:inline text-[10px] font-mono text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-right-4 duration-300 max-w-[200px] truncate mr-2">
                {funMessage}
              </span>
            )}
            <button
              onClick={() => setIsSpotlightOpen(true)}
              className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title="Search (Cmd+Space)"
            >
              <Search size={14} className="text-zinc-600 dark:text-zinc-400" />
            </button>
            <button
              onClick={() => setSoundEnabled(prev => !prev)}
              className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {soundEnabled ? (
                <Volume2 size={14} className="text-zinc-600 dark:text-zinc-400" />
              ) : (
                <VolumeX size={14} className="text-zinc-400 dark:text-zinc-600" />
              )}
            </button>
            <button
              onClick={() => setIsNotificationCenterOpen(prev => !prev)}
              className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors relative"
              title="Notifications"
            >
              <Bell size={14} className="text-zinc-600 dark:text-zinc-400" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon size={14} className="text-zinc-600 dark:text-zinc-400" />
              ) : (
                <Sun size={14} className="text-zinc-600 dark:text-zinc-400" />
              )}
            </button>
            <MenuBarClock onCycleMode={(label) => flashFunMessage(label, 2000)} />
          </div>
        </header>

        {/* Click outside to close menus */}
        {activeMenu && (
          <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
        )}

        {/* Desktop Area */}
        <main
          id="main-desktop"
          ref={desktopRef}
          className={`relative pt-14 pb-28 px-6 min-h-screen transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}
          role="main"
          aria-label="Desktop workspace"
        >
          {/* Widgets Area (left side) */}
          {showWidgets && (
            <div className="fixed top-16 left-4 z-10 flex flex-col gap-3 hidden lg:flex">
              <ClockWidget />
              <WeatherWidget />
              <GitHubWidget />
            </div>
          )}

          {/* Desktop Icons */}
          {/* Icons without custom positions - default right-side layout */}
          <div className="absolute top-14 right-4 bottom-28 flex flex-col flex-wrap-reverse content-end gap-2 items-end pointer-events-none">
            {desktopItems.filter(item => !iconPositions.find(p => p.id === item.id)).map((item, index) => (
              <div
                key={item.id}
                className="pointer-events-auto"
                style={{ opacity: draggingIconId === item.id && hasDraggedEnough ? 0.3 : 1 }}
              >
                <DesktopIcon
                  item={item}
                  onDoubleClick={handleOpenItem}
                  isDragging={false}
                  customPosition={null}
                  onDragStart={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const clientX = 'clientX' in e ? e.clientX : e.touches[0]?.clientX ?? 0;
                    const clientY = 'clientY' in e ? e.clientY : e.touches[0]?.clientY ?? 0;
                    handleIconDragStart(item.id, clientX, clientY, rect);
                  }}
                  onDragEnd={() => handleIconDragEnd()}
                />
              </div>
            ))}
          </div>

          {/* Icons with custom positions - positioned absolutely on desktop */}
          {desktopItems.filter(item => iconPositions.find(p => p.id === item.id)).map((item) => {
            const savedPos = iconPositions.find(p => p.id === item.id);
            if (!savedPos) return null;
            return (
              <div
                key={item.id}
                style={{ opacity: draggingIconId === item.id && hasDraggedEnough ? 0.3 : 1 }}
              >
                <DesktopIcon
                  item={item}
                  onDoubleClick={handleOpenItem}
                  isDragging={false}
                  customPosition={{ x: savedPos.x, y: savedPos.y }}
                  onDragStart={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const clientX = 'clientX' in e ? e.clientX : e.touches[0]?.clientX ?? 0;
                    const clientY = 'clientY' in e ? e.clientY : e.touches[0]?.clientY ?? 0;
                    handleIconDragStart(item.id, clientX, clientY, rect);
                  }}
                  onDragEnd={() => handleIconDragEnd()}
                />
              </div>
            );
          })}

          {/* Drag Ghost - follows cursor during drag (only show after threshold) */}
          {draggingIconId && dragCurrentPos && hasDraggedEnough && (() => {
            const draggingItem = desktopItems.find(i => i.id === draggingIconId);
            if (!draggingItem) return null;
            const Icon = draggingItem.icon;
            return (
              <div
                className="fixed pointer-events-none z-[2000]"
                style={{
                  left: dragCurrentPos.x - dragOffset.x,
                  top: dragCurrentPos.y - dragOffset.y,
                }}
              >
                <div className="flex flex-col items-center justify-center p-2 w-28 rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-panel ring-1 ring-red-600/50 scale-105">
                  <div className="relative mb-2">
                    <div className="w-14 h-14 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-lg">
                      <Icon className="w-7 h-7 text-black dark:text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold tracking-wider text-center text-black dark:text-zinc-300 uppercase bg-white/50 dark:bg-black/50 px-2 py-1 rounded backdrop-blur-sm truncate w-full shadow-sm">
                    {draggingItem.title}
                  </span>
                </div>
              </div>
            );
          })()}
        </main>

        {/* Windows */}
        {windows.map((win) => (
          <WindowFrame
            key={win.id}
            windowState={win}
            onClose={closeWindow}
            onCloseStart={startClosingWindow}
            onMinimize={minimizeWindow}
            onMaximize={maximizeWindow}
            onFocus={bringToFront}
            onMove={moveWindow}
            onResize={resizeWindow}
          >
            <Suspense fallback={<SkeletonLoader />}>
              {renderAppContent(win.itemId, true)}
            </Suspense>
          </WindowFrame>
        ))}

        {/* Dock */}
        <Dock
          items={DOCK_ITEMS}
          onAppClick={handleOpenItem}
          openItemIds={getOpenItemIds()}
          windows={windows}
          renderPreview={(id) => renderAppContent(id, false)}
          allItems={ALL_ITEMS}
        />

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onSortByName={sortByName}
            onSortByType={sortByType}
            onRefresh={refreshDesktop}
            onCleanUp={cleanUpIcons}
          />
        )}

        {/* Spotlight Search */}
        <Spotlight
          isOpen={isSpotlightOpen}
          onClose={() => setIsSpotlightOpen(false)}
          items={SEARCHABLE_ITEMS}
          onSelectItem={handleOpenItem}
        />

        {/* App Switcher (Cmd+Tab) */}
        <AppSwitcher
          isOpen={isAppSwitcherOpen}
          windows={windows}
          selectedIndex={appSwitcherIndex}
          allItems={ALL_ITEMS}
        />

        {/* Notification Center */}
        <NotificationCenter
          isOpen={isNotificationCenterOpen}
          notifications={notifications}
          onClose={() => setIsNotificationCenterOpen(false)}
          onDismiss={removeNotification}
          onClearAll={() => setNotifications([])}
        />


        {/* Mobile Tab Bar (replaces the dock on small screens) */}
        <MobileTabBar
          onAppsClick={() => setIsMobileDrawerOpen(true)}
          onItemClick={handleOpenItem}
          openItemIds={getOpenItemIds()}
          activeItemId={activeItemId}
        />

        {/* Mobile App Drawer (opened via the Apps tab) */}
        <MobileAppDrawer
          items={ALL_ITEMS}
          onAppClick={handleOpenItem}
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
        />

      </div>
    </div>
  );
};

export default App;