import React, { useState, useEffect } from 'react';
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
import { ContextMenu } from './components/ContextMenu';
import { CookieNotice } from './components/CookieNotice';
import { Spotlight } from './components/Spotlight';
import { Sun, Moon, Search } from 'lucide-react';
import { generateChatResponse } from './services/geminiService';

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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Desktop Items State (for sorting)
  const [desktopItems, setDesktopItems] = useState<DesktopItem[]>(DESKTOP_ITEMS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Menu Bar Dropdown State
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [funMessage, setFunMessage] = useState<string | null>(null);

  // Spotlight State
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

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

  const moveWindow = (id: string, x: number, y: number) => {
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
      default:
        return <div className="p-4">Unknown content type</div>;
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
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
          <div className="flex items-center gap-4">
            {/* Fun Message Toast */}
            {funMessage && (
              <span className="text-[10px] font-mono text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-right-4 duration-300 max-w-[200px] truncate">
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
              className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono cursor-pointer hover:text-black dark:hover:text-white transition-colors"
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
        <main className={`pt-14 pb-28 px-6 min-h-screen transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
          <div className="absolute top-14 right-4 bottom-28 flex flex-col flex-wrap-reverse content-end gap-2 items-end">
            {desktopItems.map((item) => (
              <DesktopIcon
                key={item.id}
                item={item}
                onDoubleClick={handleOpenItem}
              />
            ))}
          </div>
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
      </div>
    </div>
  );
};

export default App;