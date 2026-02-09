import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DesktopItem, WindowState, WindowRect } from '../types';

interface DockProps {
  items: DesktopItem[];
  onAppClick: (item: DesktopItem, rect?: WindowRect) => void;
  openItemIds: string[];
  windows: WindowState[];
  renderPreview: (itemId: string) => React.ReactNode;
  allItems?: DesktopItem[]; // All items including desktop items for dynamic dock icons
}

export const Dock: React.FC<DockProps> = ({ items, onAppClick, openItemIds, windows, renderPreview, allItems = [] }) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Create a list of items to show in dock:
  // 1. All permanent dock items
  // 2. Any open windows from desktop items that aren't already in dock
  const dockItemIds = new Set(items.map(i => i.id));
  // Include both the dock item's own id and any mapped appId it represents
  // (e.g. dock item id "blog-dock" represents app/window id "blog").
  const dockRepresentedIds = new Set(
    items.flatMap(i => (i.appId ? [i.id, i.appId] : [i.id]))
  );

  const dynamicItems = allItems.filter(item => {
    // Only include if it's open and not already represented in the permanent dock
    const isOpen = openItemIds.includes(item.id) || (item.appId ? openItemIds.includes(item.appId) : false);
    const representedInDock = dockRepresentedIds.has(item.id) || (item.appId ? dockRepresentedIds.has(item.appId) : false);
    return isOpen && !representedInDock;
  });

  // Combine permanent dock items with dynamic items
  const displayItems = [...items, ...dynamicItems];

  // Track screen size for accurate maximized window previews
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleItemClick = (e: React.MouseEvent, item: DesktopItem) => {
    // Don't click if we're in wobble mode
    if (isLongPress) {
      setIsLongPress(false);
      return;
    }
    const target = e.currentTarget as HTMLElement;
    const r = target.getBoundingClientRect();
    const rect: WindowRect = { x: r.left, y: r.top, width: r.width, height: r.height };
    onAppClick(item, rect);
  };

  // Long press to activate wobble mode (like iOS)
  const handleLongPressStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
    }, 500); // 500ms for long press
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Click outside to exit wobble mode
  useEffect(() => {
    if (isLongPress) {
      const handleClickOutside = () => setIsLongPress(false);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isLongPress]);

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]"
      role="toolbar"
      aria-label="Application dock"
    >
      <div className="
        flex items-center gap-2 px-4 py-2
        bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl
        border border-zinc-200 dark:border-zinc-800
        rounded-2xl shadow-2xl transition-colors
      ">
        {displayItems.map((item) => {
          const Icon = item.icon;
          const isOpen = openItemIds.includes(item.id) || (item.appId && openItemIds.includes(item.appId));
          const isHovered = hoveredItemId === item.id;
          const isDynamic = !dockItemIds.has(item.id); // Is this a dynamically added item?
          
          // Determine the window ID to preview
          const targetItemId = item.appId ? item.appId : item.id;
          // Find the actual window object
          const targetWindow = windows.find(w => w.itemId === targetItemId);

          // Calculate dimensions for the preview
          let previewWidth = 600;
          let previewHeight = 500;
          
          if (targetWindow) {
            if (targetWindow.isMaximized) {
              previewWidth = screenSize.width;
              previewHeight = screenSize.height;
            } else {
              previewWidth = targetWindow.size.width;
              previewHeight = targetWindow.size.height;
            }
          }

          // Calculate scale to fit in a 192x144 box (4:3 aspect ratio approx)
          const MAX_PREVIEW_W = 200;
          const MAX_PREVIEW_H = 150;
          const scaleX = MAX_PREVIEW_W / previewWidth;
          const scaleY = MAX_PREVIEW_H / previewHeight;
          const scale = Math.min(scaleX, scaleY);

          return (
            <div
              key={item.id}
              className={`relative flex flex-col items-center ${isDynamic ? 'animate-in fade-in slide-in-from-bottom-4 duration-300' : ''}`}
            >

              {/* Window Preview Bubble */}
              {isHovered && targetWindow && (
                <div className="absolute -top-52 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-200 z-50 pointer-events-none">
                    <div className="relative p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-zinc-300 dark:border-zinc-700">
                        
                        {/* Preview Header */}
                        <div className="flex items-center justify-between w-full mb-2 pl-1 pr-1 gap-4">
                             <div className="flex items-center gap-1.5">
                                 <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm"></div>
                                 <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                             </div>
                             <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-bold truncate max-w-[120px]">
                                {targetWindow.title}
                             </span>
                        </div>

                        {/* Minimized Overlay Indicator */}
                        {targetWindow.isMinimized && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 dark:bg-black/40 rounded-xl pointer-events-none">
                            <span className="bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest shadow-lg">
                              Minimized
                            </span>
                          </div>
                        )}

                        {/* Scaled Preview Container */}
                        <div 
                          className="bg-white dark:bg-zinc-950 rounded-lg overflow-hidden relative shadow-inner ring-1 ring-black/5 dark:ring-white/5"
                          style={{ width: MAX_PREVIEW_W, height: MAX_PREVIEW_H }}
                        >
                             <div 
                                className="absolute top-0 left-0 origin-top-left pointer-events-none select-none"
                                style={{
                                    width: previewWidth,
                                    height: previewHeight,
                                    transform: `scale(${scale})`
                                }}
                             >
                                {renderPreview(targetItemId)}
                             </div>
                        </div>
                        
                        {/* Arrow */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-100 dark:bg-zinc-900 rotate-45 border-r border-b border-zinc-300 dark:border-zinc-700"></div>
                    </div>
                </div>
              )}

              <button
                onClick={(e) => handleItemClick(e, item)}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => {
                  setHoveredItemId(null);
                  handleLongPressEnd();
                }}
                onMouseDown={handleLongPressStart}
                onMouseUp={handleLongPressEnd}
                onTouchStart={handleLongPressStart}
                onTouchEnd={handleLongPressEnd}
                className={`group relative flex flex-col items-center justify-center transition-all hover:-translate-y-2 duration-300 ${isLongPress ? 'dock-wobble' : ''}`}
                aria-label={`Open ${item.title}${isOpen ? ' (running)' : ''}`}
                title={item.title}
              >
                <div className={`
                  w-10 h-10 flex items-center justify-center
                  rounded-xl border transition-all duration-300
                  ${targetWindow?.isMinimized
                    ? 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 opacity-70 grayscale'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-100 group-hover:border-zinc-400 dark:group-hover:border-white'
                  }
                  shadow-sm
                `}>
                  <Icon className="w-5 h-5 text-black dark:text-white group-hover:text-black transition-colors" />
                </div>
                
                {/* Tooltip (Only show if NOT showing preview to avoid clutter) */}
                {!targetWindow && (
                    <span className="
                    absolute -top-12 opacity-0 group-hover:opacity-100
                    text-[10px] uppercase tracking-wider font-bold bg-black dark:bg-white text-white dark:text-black
                    px-2 py-1 rounded transition-opacity whitespace-nowrap pointer-events-none
                    ">
                    {item.title}
                    </span>
                )}
                
                {/* Active Dot indicator below */}
                <div className={`
                  absolute -bottom-3 w-1 h-1 rounded-full transition-all duration-300
                  ${isOpen 
                    ? targetWindow?.isMinimized ? 'bg-zinc-400 dark:bg-zinc-600 w-1.5 h-1.5' : 'bg-red-600 w-1.5 h-1.5'
                    : 'bg-black dark:bg-white opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100'
                  }
                `} />
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
};