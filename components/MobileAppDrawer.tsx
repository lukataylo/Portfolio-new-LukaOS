import React, { useState, useRef } from 'react';
import { DesktopItem } from '../types';
import { X } from 'lucide-react';

interface MobileAppDrawerProps {
  items: DesktopItem[];
  onAppClick: (item: DesktopItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Bottom-sheet app drawer for mobile. Fully hidden when closed — it is
 * opened via the tab bar's Apps tab and dismissed by backdrop tap, the
 * close button, or swiping the handle down.
 */
export const MobileAppDrawer: React.FC<MobileAppDrawerProps> = ({
  items,
  onAppClick,
  isOpen,
  onClose
}) => {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Swipe-down on the handle to close
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientY - startY.current;
    setDragY(Math.max(0, diff));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 100) {
      onClose();
    }
    setDragY(0);
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

  const getDrawerStyle = (): React.CSSProperties => {
    if (isDragging && isOpen) {
      return { transform: `translateY(${dragY}px)` };
    }
    return {
      transform: isOpen ? 'translateY(0)' : 'translateY(100%)'
    };
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[130] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="App drawer"
        aria-modal="true"
        className="fixed bottom-0 left-0 right-0 z-[131] transition-transform duration-300 ease-out md:hidden"
        style={getDrawerStyle()}
        aria-hidden={!isOpen}
      >
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-t-3xl border-t border-x border-black/5 dark:border-white/10 shadow-panel">
          {/* Swipe region: handle + header only. Attaching the gesture here
              keeps normal scrolling inside the app grid from dragging the
              drawer closed. */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Pull Handle */}
            <div
              className="flex items-center justify-center py-3 cursor-pointer"
              onClick={onClose}
            >
              <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-3">
              <h3 className="text-sm font-bold text-black dark:text-white">All Apps</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                aria-label="Close app drawer"
              >
                <X size={18} className="text-zinc-500" />
              </button>
            </div>
          </div>

          {/* App Grid — includes external links (GitHub, Twitter, …), which
              open in a new tab via the normal open-item path. */}
          <div className="px-4 pb-8 max-h-[70dvh] overflow-y-auto pb-safe">
            <div className="grid grid-cols-4 gap-4">
              {items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAppClick(item)}
                    className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all"
                    aria-label={`Open ${item.title}`}
                  >
                    <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-soft border border-black/5 dark:border-white/10">
                      <Icon size={28} className="text-zinc-600 dark:text-zinc-300" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 text-center line-clamp-2 leading-tight">
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
