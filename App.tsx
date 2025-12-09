import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DESKTOP_ITEMS, DOCK_ITEMS, INITIAL_WINDOW_HEIGHT, INITIAL_WINDOW_WIDTH } from './constants';
import { DesktopItem, WindowState, FileType, ChatMessage, WindowRect } from './types';
import { DesktopIcon } from './components/DesktopIcon';
import { Dock } from './components/Dock';
import { WindowFrame } from './components/window/WindowFrame';
import { PresentationViewer } from './components/content/PresentationViewer';
import { PasswordLock } from './components/content/PasswordLock';
import { ChatApp } from './components/content/ChatApp';
import { BrowserApp } from './components/content/BrowserApp';
import { BlogApp } from './components/content/BlogApp';
import { BooksApp } from './components/content/BooksApp';
import { TerminalApp } from './components/content/TerminalApp';
import { MailCompose } from './components/content/MailCompose';
import { SkeletonLoader } from './components/content/SkeletonLoader';
import { SitemapViewer } from './components/content/SitemapViewer';
import { FinderApp } from './components/content/FinderApp';
import { SystemPreferences } from './components/content/SystemPreferences';
import { ContextMenu } from './components/ContextMenu';
import { CookieNotice } from './components/CookieNotice';
import { Spotlight } from './components/Spotlight';
import { MobileAppDrawer } from './components/MobileAppDrawer';
import { ClockWidget, WeatherWidget, GitHubWidget } from './components/widgets';
import { Sun, Moon, Search, Volume2, VolumeX, Bell, X, Settings, Folder } from 'lucide-react';
import { generateChatResponse } from './services/geminiService';
import { loadTheme, saveTheme, loadSoundEnabled, saveSoundEnabled, loadReduceMotion, saveReduceMotion, loadIconPositions, saveIconPositions, IconPosition } from './utils/storage';

// Helper component to simulate fetching data
const DelayedLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate network delay
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <SkeletonLoader />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme());

  // Desktop Items State (for sorting and positioning)
  const [desktopItems, setDesktopItems] = useState<DesktopItem[]>(DESKTOP_ITEMS);
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
  const [funMessage, setFunMessage] = useState<string | null>(null);

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

  // Loading cursor state (beach ball effect)
  const [isLoading, setIsLoading] = useState(false);

  // Easter Egg States
  const [konamiActivated, setKonamiActivated] = useState(false);
  const [clockMode, setClockMode] = useState<'normal' | 'binary' | 'hex' | 'coffee'>('normal');
  const [clockClicks, setClockClicks] = useState(0);

  // Lifted States
  const [unlockedItemIds, setUnlockedItemIds] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'System Online. I am the portfolio assistant. Ask me about the projects or the engineer.' }
  ]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Track mouse/touch movement during icon drag
  useEffect(() => {
    if (!draggingIconId || !dragStartPos) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY };
      setDragCurrentPos(newPos);

      // Check if we've moved past the threshold
      if (!hasDraggedEnough) {
        const dx = Math.abs(newPos.x - dragStartPos.x);
        const dy = Math.abs(newPos.y - dragStartPos.y);
        if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
          setHasDraggedEnough(true);
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const newPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setDragCurrentPos(newPos);

        // Check if we've moved past the threshold
        if (!hasDraggedEnough) {
          const dx = Math.abs(newPos.x - dragStartPos.x);
          const dy = Math.abs(newPos.y - dragStartPos.y);
          if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
            setHasDraggedEnough(true);
          }
        }
      }
    };

    const handleMouseUp = () => {
      handleIconDragEnd();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [draggingIconId, dragStartPos, hasDraggedEnough, handleIconDragEnd]);

  // Konami Code Easter Egg (↑↑↓↓←→←→BA)
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let konamiIndex = 0;

    const handleKonami = (e: KeyboardEvent) => {
      if (e.code === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          setKonamiActivated(true);
          setFunMessage('🎮 KONAMI CODE ACTIVATED! Retro mode enabled!');
          setTimeout(() => setFunMessage(null), 3000);
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

  // Clock click handler - cycle through time formats
  const handleClockClick = () => {
    const newClicks = clockClicks + 1;
    setClockClicks(newClicks);

    if (newClicks >= 4) {
      setClockClicks(0);
      setClockMode('normal');
    } else if (newClicks === 1) {
      setClockMode('binary');
      setFunMessage('🤖 Binary time activated');
      setTimeout(() => setFunMessage(null), 2000);
    } else if (newClicks === 2) {
      setClockMode('hex');
      setFunMessage('💻 Hex time activated');
      setTimeout(() => setFunMessage(null), 2000);
    } else if (newClicks === 3) {
      setClockMode('coffee');
      setFunMessage('☕ It\'s always coffee time');
      setTimeout(() => setFunMessage(null), 2000);
    }
  };

  // Format time based on mode
  const formatTime = () => {
    const hours = time.getHours();
    const minutes = time.getMinutes();

    switch (clockMode) {
      case 'binary':
        return `${hours.toString(2).padStart(5, '0')}:${minutes.toString(2).padStart(6, '0')}`;
      case 'hex':
        return `0x${hours.toString(16).toUpperCase()}:${minutes.toString(16).toUpperCase().padStart(2, '0')}`;
      case 'coffee':
        return '☕:☕☕';
      default:
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

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
        setFunMessage("🚫 Quit? But we were just getting started!");
        setTimeout(() => setFunMessage(null), 3000);
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
  }, [activeWindowId, windows, isAppSwitcherOpen, appSwitcherIndex]);

  // Sound effect helper
  const playSound = (type: 'pop' | 'close' | 'minimize' | 'notification' | 'click') => {
    if (!soundEnabled) return;

    // Create audio context for sounds
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      switch (type) {
        case 'pop':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.05);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
          break;
        case 'close':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.15);
          gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.15);
          break;
        case 'minimize':
          oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
          break;
        case 'notification':
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
        case 'click':
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.05);
          break;
      }
    } catch (e) {
      // Audio not supported
    }
  };

  // Add welcome notification on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification('Welcome!', 'Welcome to LukaOS. Try Cmd+Space for search!');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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

  // --- ROUTER & SEO LOGIC ---
  useEffect(() => {
      // 1. Handle Initial Hash Route
      const handleHashRoute = () => {
          const hash = window.location.hash; // e.g., #/about or #/blog/post-1
          if (!hash) {
              // Default to Sitemap/About if no hash on first load? Or just Desktop.
              // Let's default to About Me if specifically asked in reqs, else Sitemap is good.
              // Requirement: "Langpage should open on one presentation" -> About Me
              const aboutMe = DESKTOP_ITEMS.find(i => i.id === 'about-me');
              if (aboutMe) handleOpenItem(aboutMe);
              return;
          }

          const route = hash.replace('#/', '');
          // Basic Route Matching
          const targetItem = [...DESKTOP_ITEMS, ...DOCK_ITEMS].find(i => 
              i.slug === route || i.id === route || (route.startsWith('blog/') && i.id === 'blog')
          );

          if (targetItem) {
              handleOpenItem(targetItem);
          }
      };
      
      // Delay slightly to allow App to mount fully
      setTimeout(handleHashRoute, 100);

      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Page Title / Meta based on Active Window
  useEffect(() => {
      const activeWindow = windows.find(w => w.id === activeWindowId);
      const baseTitle = "Luka Dadiani | Product Manager & Engineer";
      
      if (activeWindow) {
          const item = [...DESKTOP_ITEMS, ...DOCK_ITEMS].find(i => i.id === activeWindow.itemId);
          if (item) {
              // Update Title
              document.title = `${item.title} | Luka Dadiani`;
              
              // Update Meta Description
              const metaDesc = document.querySelector('meta[name="description"]');
              if (metaDesc && item.seoDescription) {
                  metaDesc.setAttribute('content', item.seoDescription);
              }

              // Update URL Hash if not already set (for deep linking persistence)
              const newHash = `#/${item.slug || item.id}`;
              if (window.location.hash !== newHash && !window.location.hash.includes(item.id + '/')) {
                  window.history.replaceState(null, '', newHash);
              }
          }
      } else {
          document.title = baseTitle;
          window.history.replaceState(null, '', ' '); // Clear hash when desktop focused
      }
  }, [activeWindowId, windows]);

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
      
      // Call Service
      const responseText = await generateChatResponse(history, text);
      
      setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
  };

  const bringToFront = (id: string) => {
    setActiveWindowId(id);
    setWindows(prev => {
      const maxZ = prev.length > 0 ? Math.max(10, ...prev.map(w => w.zIndex)) : 10;
      return prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w);
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
      if (existingWindow.isMinimized) {
        // Restore window
        setWindows(prev => prev.map(w => w.id === existingWindow.id ? { ...w, isMinimized: false } : w));
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
    let initialWidth = INITIAL_WINDOW_WIDTH;
    let initialHeight = INITIAL_WINDOW_HEIGHT;

    if (isMobile) {
        initialWidth = window.innerWidth - 32;
        initialHeight = window.innerHeight - 100;
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
    let startX = isMobile ? 16 : 100;
    let startY = isMobile ? 16 : 100;
    
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

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    // Focus another window or clear active
    setActiveWindowId(prev => {
      if (prev === id) {
        const remaining = windows.filter(w => w.id !== id && !w.isMinimized);
        return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
      }
      return prev;
    });
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    // Focus another window
    const remaining = windows.filter(w => w.id !== id && !w.isMinimized);
    setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  };

  // Window tiling - snap to edges
  const handleWindowSnapCheck = useCallback((id: string, x: number, y: number) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - 36 - 60; // Minus menu bar (36px) and dock (~60px)
    const snapThreshold = 30;

    // Left edge - snap to left half
    if (x <= snapThreshold) {
      return { x: 0, y: 36, width: screenWidth / 2, height: screenHeight };
    }
    // Right edge - snap to right half
    if (x >= screenWidth - snapThreshold) {
      return { x: screenWidth / 2, y: 36, width: screenWidth / 2, height: screenHeight };
    }
    // Top edge - maximize
    if (y <= snapThreshold + 36) {
      return { x: 0, y: 36, width: screenWidth, height: screenHeight };
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

  const renderWindowContent = (win: WindowState) => {
    const item = [...DESKTOP_ITEMS, ...DOCK_ITEMS].find(i => i.id === win.itemId);

    // Handle AI Chat App
    if (win.itemId === 'ai-chat') {
      return <ChatApp messages={chatMessages} onSendMessage={handleChatSend} />;
    }

    if (!item) return <div className="p-4">Content not found</div>;

    switch (item.type) {
      case FileType.PRESENTATION:
        return (
          <DelayedLoader>
            <PresentationViewer slides={item.content || []} />
          </DelayedLoader>
        );
      case FileType.PROTECTED:
        const isUnlocked = unlockedItemIds.includes(item.id);
        if (isUnlocked && item.lockedContent) {
          return (
            <DelayedLoader>
              <PresentationViewer slides={item.lockedContent} />
            </DelayedLoader>
          );
        }
        return (
          <PasswordLock
            correctPassword={item.password || ''}
            onUnlock={() => setUnlockedItemIds(prev => [...prev, item.id])}
          />
        );
      case FileType.LINK:
        return <BrowserApp initialUrl={item.url || ''} />;
      case FileType.BLOG:
        return (
          <DelayedLoader>
            <BlogApp posts={item.blogPosts || []} />
          </DelayedLoader>
        );
      case FileType.BOOKS:
        return (
          <DelayedLoader>
            <BooksApp books={item.books || []} />
          </DelayedLoader>
        );
      case FileType.TERMINAL:
        return <TerminalApp />;
      case FileType.MAIL:
        return <MailCompose recipientEmail="luka.taylor@gmail.com" recipientName="Luka Dadiani" />;
      case FileType.SITEMAP:
        return (
          <SitemapViewer
            desktopItems={DESKTOP_ITEMS}
            dockItems={DOCK_ITEMS}
            onItemClick={handleOpenItem}
          />
        );
      case FileType.FINDER:
        return (
          <FinderApp
            items={[...DESKTOP_ITEMS, ...DOCK_ITEMS.filter(i => i.type !== FileType.EXTERNAL_LINK && i.type !== FileType.FINDER)]}
            onItemClick={handleOpenItem}
          />
        );
      case FileType.PREFERENCES:
        return (
          <SystemPreferences
            theme={theme}
            onThemeChange={setTheme}
            soundEnabled={soundEnabled}
            onSoundChange={setSoundEnabled}
          />
        );
      default:
        return <div className="p-4">Unknown content type</div>;
    }
  };

  // Render content for Dock previews (same as window content but without loader delay for snappier previews)
  const renderPreviewContent = (itemId: string) => {
    const item = [...DESKTOP_ITEMS, ...DOCK_ITEMS].find(i => i.id === itemId);

    if (itemId === 'ai-chat') {
      return <ChatApp messages={chatMessages} onSendMessage={async () => {}} />;
    }

    if (!item) return <div className="p-4">Content not found</div>;

    switch (item.type) {
      case FileType.PRESENTATION:
        return <PresentationViewer slides={item.content || []} />;
      case FileType.PROTECTED:
        const isUnlocked = unlockedItemIds.includes(item.id);
        if (isUnlocked && item.lockedContent) {
          return <PresentationViewer slides={item.lockedContent} />;
        }
        return (
          <PasswordLock
            correctPassword={item.password || ''}
            onUnlock={() => {}}
          />
        );
      case FileType.LINK:
        return <BrowserApp initialUrl={item.url || ''} />;
      case FileType.BLOG:
        return <BlogApp posts={item.blogPosts || []} />;
      case FileType.BOOKS:
        return <BooksApp books={item.books || []} />;
      case FileType.TERMINAL:
        return <TerminalApp />;
      case FileType.MAIL:
        return <MailCompose recipientEmail="luka.taylor@gmail.com" recipientName="Luka Dadiani" />;
      case FileType.SITEMAP:
        return (
          <SitemapViewer
            desktopItems={DESKTOP_ITEMS}
            dockItems={DOCK_ITEMS}
            onItemClick={() => {}}
          />
        );
      case FileType.FINDER:
        return (
          <FinderApp
            items={[...DESKTOP_ITEMS, ...DOCK_ITEMS.filter(i => i.type !== FileType.EXTERNAL_LINK && i.type !== FileType.FINDER)]}
            onItemClick={() => {}}
          />
        );
      case FileType.PREFERENCES:
        return (
          <SystemPreferences
            theme={theme}
            onThemeChange={() => {}}
            soundEnabled={soundEnabled}
            onSoundChange={() => {}}
          />
        );
      default:
        return <div className="p-4">Unknown content type</div>;
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} ${reduceMotion ? 'motion-reduce' : ''}`}>
      {/* Skip Navigation Link for Accessibility */}
      <a
        href="#main-desktop"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[1000] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none"
      >
        Skip to main content
      </a>

      <div
        className={`min-h-screen relative overflow-hidden bg-[#f0f0f0] dark:bg-[#0f0f0f] transition-colors duration-500 ${konamiActivated ? 'konami-retro' : ''}`}
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
        <header className="fixed top-0 left-0 right-0 h-9 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 z-50 transition-colors">
          <div className="flex items-center gap-4">
            {/* LukaOS Menu (Apple-style) */}
            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setActiveMenu(activeMenu === 'about' ? null : 'about')}
              >
                <div className={`w-3 h-3 bg-red-600 rounded-full transition-transform ${activeMenu === 'about' ? 'scale-125' : ''}`} />
                <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${activeMenu === 'about' ? 'text-red-600' : 'text-black dark:text-white'}`}>
                  LukaOS
                </span>
              </div>
              {activeMenu === 'about' && (
                <div className="absolute top-8 left-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-0 w-[320px] z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                  {/* Header */}
                  <div className="p-4 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
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
                  <div className="p-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Inspired By</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300">macOS</span>
                      <span className="text-[10px] px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300">Nothing Phone</span>
                      <span className="text-[10px] px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300">PostHog</span>
                    </div>
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
              {/* File Menu */}
              <div className="relative">
                <span
                  onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
                  className={`text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${activeMenu === 'file' ? 'text-red-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'}`}
                >
                  File
                </span>
                {activeMenu === 'file' && (
                  <div className="absolute top-6 left-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl p-1 min-w-[180px] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button onClick={() => { setFunMessage("Creating new file... just kidding, I'm a portfolio!"); setActiveMenu(null); setTimeout(() => setFunMessage(null), 3000); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">New File (Pretend)</button>
                    <button onClick={() => { setFunMessage("Opening... my heart to new opportunities!"); setActiveMenu(null); setTimeout(() => setFunMessage(null), 3000); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Open Happiness</button>
                    <button onClick={() => { setFunMessage("Saved to your memory! (Hopefully)"); setActiveMenu(null); setTimeout(() => setFunMessage(null), 3000); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Save to Memory</button>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                    <button onClick={() => { setFunMessage("You can't quit me that easily!"); setActiveMenu(null); setTimeout(() => setFunMessage(null), 3000); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-red-500">Quit (Nice Try)</button>
                  </div>
                )}
              </div>

              {/* Edit Menu */}
              <div className="relative">
                <span
                  onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
                  className={`text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${activeMenu === 'edit' ? 'text-red-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'}`}
                >
                  Edit
                </span>
                {activeMenu === 'edit' && (
                  <div className="absolute top-6 left-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl p-1 min-w-[180px] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button onClick={() => { setFunMessage("Undo what? Your life choices? Same."); setActiveMenu(null); setTimeout(() => setFunMessage(null), 3000); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Undo Regrets</button>
                    <button onClick={() => { setFunMessage("Redoing... *types furiously*"); setActiveMenu(null); setTimeout(() => setFunMessage(null), 3000); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Redo That Thing</button>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                    <button onClick={() => { navigator.clipboard.writeText("Luka Dadiani - Product Manager & Designer"); setFunMessage("Copied my essence to clipboard!"); setActiveMenu(null); setTimeout(() => setFunMessage(null), 3000); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Copy My Vibe</button>
                    <button onClick={() => { setFunMessage("Pasting enthusiasm... done!"); setActiveMenu(null); setTimeout(() => setFunMessage(null), 3000); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Paste Enthusiasm</button>
                    <button onClick={() => { setFunMessage("Selected everything. You're welcome."); setActiveMenu(null); setTimeout(() => setFunMessage(null), 3000); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Select All The Things</button>
                  </div>
                )}
              </div>

              {/* View Menu */}
              <div className="relative">
                <span
                  onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
                  className={`text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${activeMenu === 'view' ? 'text-red-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'}`}
                >
                  View
                </span>
                {activeMenu === 'view' && (
                  <div className="absolute top-6 left-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl p-1 min-w-[180px] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button onClick={() => { document.body.style.transform = 'scale(1.5)'; setTimeout(() => document.body.style.transform = '', 500); setFunMessage("ZOOMING IN!"); setActiveMenu(null); setTimeout(() => setFunMessage(null), 2000); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Zoom In (Dramatically)</button>
                    <button onClick={() => { document.body.style.transform = 'scale(0.8)'; setTimeout(() => document.body.style.transform = '', 500); setFunMessage("zooming out..."); setActiveMenu(null); setTimeout(() => setFunMessage(null), 2000); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Zoom Out (Quietly)</button>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                    <button onClick={() => { document.body.style.transition = 'transform 1s'; document.body.style.transform = 'rotate(360deg)'; setTimeout(() => { document.body.style.transform = ''; document.body.style.transition = ''; }, 1000); setFunMessage("Wheeeee!"); setActiveMenu(null); setTimeout(() => setFunMessage(null), 2000); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Do a Barrel Roll</button>
                    <button onClick={() => { toggleTheme(); setFunMessage(theme === 'light' ? "Welcome to the dark side!" : "Let there be light!"); setActiveMenu(null); setTimeout(() => setFunMessage(null), 3000); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Toggle Dimension</button>
                    <button onClick={() => { setFunMessage("You're already in full screen... in my heart."); setActiveMenu(null); setTimeout(() => setFunMessage(null), 3000); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Enter Full Heart Mode</button>
                  </div>
                )}
              </div>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {/* Fun Message Toast */}
            {funMessage && (
              <span className="text-[10px] font-mono text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-right-4 duration-300 max-w-[200px] truncate mr-2">
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
            <span
              onClick={handleClockClick}
              className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono cursor-pointer hover:text-black dark:hover:text-white transition-colors ml-1"
              title="Click to change time format"
            >
              {formatTime()}
            </span>
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
                <div className="flex flex-col items-center justify-center p-2 w-28 rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-2xl ring-2 ring-blue-500 scale-105">
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
            onMinimize={minimizeWindow}
            onMaximize={maximizeWindow}
            onFocus={bringToFront}
            onMove={moveWindow}
            onResize={resizeWindow}
          >
            {renderWindowContent(win)}
          </WindowFrame>
        ))}

        {/* Dock */}
        <Dock
          items={DOCK_ITEMS}
          onAppClick={handleOpenItem}
          openItemIds={getOpenItemIds()}
          windows={windows}
          renderPreview={renderPreviewContent}
          allItems={[...DESKTOP_ITEMS, ...DOCK_ITEMS]}
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

        {/* Cookie Notice */}
        <CookieNotice />

        {/* Spotlight Search */}
        <Spotlight
          isOpen={isSpotlightOpen}
          onClose={() => setIsSpotlightOpen(false)}
          items={[...DESKTOP_ITEMS, ...DOCK_ITEMS.filter(item => item.type !== FileType.EXTERNAL_LINK)]}
          onSelectItem={handleOpenItem}
        />

        {/* App Switcher (Cmd+Tab) */}
        {isAppSwitcherOpen && (
          <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200]" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-2xl p-4">
                <div className="flex items-center gap-4">
                  {windows.filter(w => !w.isMinimized).map((win, index) => {
                    const item = [...DESKTOP_ITEMS, ...DOCK_ITEMS].find(i => i.id === win.itemId);
                    const Icon = item?.icon;
                    const isSelected = index === appSwitcherIndex;

                    return (
                      <div
                        key={win.id}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                          isSelected ? 'bg-blue-500 scale-110' : 'bg-zinc-100 dark:bg-zinc-800'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-white/20' : 'bg-white dark:bg-zinc-700'
                        }`}>
                          {Icon && <Icon size={28} className={isSelected ? 'text-white' : 'text-black dark:text-white'} />}
                        </div>
                        <span className={`text-[10px] font-medium truncate max-w-[80px] ${
                          isSelected ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'
                        }`}>
                          {win.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-[10px] text-zinc-400 mt-3">
                  Release ⌘ to switch
                </p>
              </div>
            </div>
          </>
        )}

        {/* Notification Center */}
        {isNotificationCenterOpen && (
          <>
            <div
              className="fixed inset-0 z-[150]"
              onClick={() => setIsNotificationCenterOpen(false)}
            />
            <div className="fixed top-10 right-2 w-80 max-h-[500px] overflow-hidden z-[151] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-black dark:text-white">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => setNotifications([])}
                      className="text-[10px] text-blue-500 hover:text-blue-600"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
                      <p className="text-xs text-zinc-400">No notifications</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-black dark:text-white">{notif.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{notif.message}</p>
                            <p className="text-[10px] text-zinc-400 mt-1">
                              {notif.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <button
                            onClick={() => removeNotification(notif.id)}
                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                          >
                            <X size={12} className="text-zinc-400" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Mobile App Drawer */}
        <MobileAppDrawer
          items={[...DESKTOP_ITEMS, ...DOCK_ITEMS]}
          onAppClick={handleOpenItem}
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          onOpen={() => setIsMobileDrawerOpen(true)}
        />

        {/* Loading Cursor (Beach Ball) */}
        {isLoading && (
          <div className="fixed inset-0 z-[300] pointer-events-none flex items-center justify-center">
            <div className="w-8 h-8 animate-spin">
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <defs>
                  <linearGradient id="beachball" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="25%" stopColor="#4ecdc4" />
                    <stop offset="50%" stopColor="#45b7d1" />
                    <stop offset="75%" stopColor="#96e6a1" />
                    <stop offset="100%" stopColor="#ff6b6b" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="14" fill="none" stroke="url(#beachball)" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;