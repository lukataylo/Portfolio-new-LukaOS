import React, { useState, useRef, useEffect } from 'react';
import { DesktopItem, FileType } from '../types';
import { ChevronUp, X } from 'lucide-react';

interface MobileAppDrawerProps {
  items: DesktopItem[];
  onAppClick: (item: DesktopItem) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const MobileAppDrawer: React.FC<MobileAppDrawerProps> = ({
  items,
  onAppClick,
  isOpen,
  onClose,
  onOpen
}) => {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Filter out external links for the drawer
  const drawerItems = items.filter(item => item.type !== FileType.EXTERNAL_LINK);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = startY.current - currentY;

    if (isOpen) {
      // When open, allow dragging down
      setDragY(Math.max(0, -diff));
    } else {
      // When closed, allow dragging up
      setDragY(Math.max(0, diff));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (isOpen && dragY > 100) {
      onClose();
    } else if (!isOpen && dragY > 50) {
      onOpen();
    }

    setDragY(0);
  };

  // Handle click on handle area
  const handleClick = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  };

  // Haptic feedback on iOS (if supported)
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleAppClick = (item: DesktopItem) => {
    triggerHaptic();
    onAppClick(item);
    onClose();
  };

  // Calculate drawer position
  const getDrawerStyle = (): React.CSSProperties => {
    if (isDragging) {
      if (isOpen) {
        return { transform: `translateY(${dragY}px)` };
      } else {
        return { transform: `translateY(calc(100% - 60px - ${dragY}px))` };
      }
    }

    return {
      transform: isOpen ? 'translateY(0)' : 'translateY(calc(100% - 60px))'
    };
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed bottom-0 left-0 right-0 z-[101] transition-transform duration-300 ease-out md:hidden"
        style={getDrawerStyle()}
      >
        {/* Handle Area */}
        <div
          className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-t-3xl border-t border-x border-zinc-200 dark:border-zinc-800 shadow-2xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Pull Handle */}
          <div
            className="flex items-center justify-center py-3 cursor-pointer"
            onClick={handleClick}
          >
            <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
          </div>

          {/* Header when open */}
          {isOpen && (
            <div className="flex items-center justify-between px-6 pb-3">
              <h3 className="text-sm font-bold text-black dark:text-white">All Apps</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={18} className="text-zinc-500" />
              </button>
            </div>
          )}

          {/* Peek preview when closed */}
          {!isOpen && (
            <div className="flex items-center justify-center gap-2 pb-4 px-4">
              <ChevronUp size={16} className="text-zinc-400" />
              <span className="text-xs text-zinc-400">Swipe up for apps</span>
            </div>
          )}

          {/* App Grid */}
          <div
            className="px-4 pb-8 max-h-[70vh] overflow-y-auto"
            style={{ display: isOpen ? 'block' : 'none' }}
          >
            <div className="grid grid-cols-4 gap-4">
              {drawerItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAppClick(item)}
                    className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl flex items-center justify-center shadow-sm border border-zinc-200 dark:border-zinc-700">
                      <Icon size={28} className="text-zinc-600 dark:text-zinc-300" />
                    </div>
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 text-center line-clamp-2 leading-tight">
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Safe area padding */}
          <div className="h-safe-area-inset-bottom bg-white/90 dark:bg-zinc-900/90" />
        </div>
      </div>
    </>
  );
};
