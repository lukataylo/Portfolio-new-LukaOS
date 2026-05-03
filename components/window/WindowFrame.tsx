import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WindowState } from '../../types';
import { X, Minus, Maximize2, RotateCcw, Copy } from 'lucide-react';
import { MENU_BAR_H, DOCK_H, SNAP_THRESHOLD, WINDOW_MIN_W, WINDOW_MIN_H } from '../../src/constants/layout';

interface WindowFrameProps {
  windowState: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number, shouldSnap?: boolean) => void;
  onResize: (id: string, width: number, height: number) => void;
  children: React.ReactNode;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
type AnimationState = 'closed' | 'opening' | 'open' | 'closing';

interface ResizeHandleSpec {
  dir: ResizeDirection;
  className: string;
  style: React.CSSProperties;
}

const SIDE_THICKNESS = '14px';
const CORNER_SIZE = { width: '24px', height: '24px' };

const RESIZE_HANDLES: ResizeHandleSpec[] = [
  { dir: 'n', className: 'absolute -top-1 left-3 right-3 cursor-n-resize z-50', style: { height: SIDE_THICKNESS } },
  { dir: 's', className: 'absolute -bottom-1 left-3 right-3 cursor-s-resize z-50', style: { height: SIDE_THICKNESS } },
  { dir: 'w', className: 'absolute top-3 bottom-3 -left-1 cursor-w-resize z-50', style: { width: SIDE_THICKNESS } },
  { dir: 'e', className: 'absolute top-3 bottom-3 -right-1 cursor-e-resize z-50', style: { width: SIDE_THICKNESS } },
  { dir: 'nw', className: 'absolute -top-1 -left-1 cursor-nw-resize z-50', style: CORNER_SIZE },
  { dir: 'ne', className: 'absolute -top-1 -right-1 cursor-ne-resize z-50', style: CORNER_SIZE },
  { dir: 'sw', className: 'absolute -bottom-1 -left-1 cursor-sw-resize z-50', style: CORNER_SIZE },
  { dir: 'se', className: 'absolute -bottom-1 -right-1 cursor-se-resize z-50', style: CORNER_SIZE },
];

export const WindowFrame: React.FC<WindowFrameProps> = ({
  windowState,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onResize,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [snapPreview, setSnapPreview] = useState<'left' | 'right' | 'full' | null>(null);
  const [windowContextMenu, setWindowContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Start in 'closed' state to render the initial frame at the icon's position
  const [animState, setAnimState] = useState<AnimationState>('closed');

  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const windowStartRect = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const resizeDir = useRef<ResizeDirection | null>(null);
  // Mirror snapPreview into a ref so the drag-end handler reads the current value,
  // not the stale closure captured when the effect first ran.
  const snapPreviewRef = useRef(snapPreview);
  snapPreviewRef.current = snapPreview;
  // Tracks whether this drag began from a maximized/snapped state; used to
  // skip the redundant snap-restore on mouseup that would cause a small jump.
  const unsnappedAtDragStart = useRef(false);
  // Tracked timers so we can cancel them if the component unmounts before they fire.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending timers on unmount so callbacks don't fire against a disposed window.
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (bounceTimer.current) clearTimeout(bounceTimer.current);
    };
  }, []);

  // Animation Lifecycle
  useEffect(() => {
    // 1. Initial Render is 'closed' (hidden/at origin).
    // 2. Wait a tick for DOM paint.
    // 3. Set 'opening' to trigger CSS transition to target position.
    const timer1 = setTimeout(() => {
        setAnimState('opening');
    }, 50);

    // 4. After transition completes, set to 'open' to enable full interaction.
    // Duration matches the CSS transition time (500ms)
    const timer2 = setTimeout(() => {
        setAnimState('open');
    }, 550); 

    return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
    };
  }, []);

  const handleCloseRequest = () => {
    // Closing animation works against the *normal* render path, so any maximized
    // / snapped state must be cleared first or the window stays glued to the chrome.
    if (windowState.isMaximized || windowState.isSnapped) {
      onResize(
        windowState.id,
        windowState.preSnapRect?.width ?? windowState.size.width,
        windowState.preSnapRect?.height ?? windowState.size.height,
      );
      onMove(windowState.id, windowState.preSnapRect?.x ?? windowState.position.x, windowState.preSnapRect?.y ?? windowState.position.y);
      // Force the maximized flag off via the standard toggle
      if (windowState.isMaximized) onMaximize(windowState.id);
    }
    setAnimState('closing');
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => onClose(windowState.id), 350);
  };

  // Restore a maximized / snapped window to its previous size and place it
  // under the cursor so the user can keep dragging from where they grabbed it.
  const restoreFromChrome = (cursorX: number, cursorY: number) => {
    const prev = windowState.preSnapRect;
    const restoredW = prev?.width ?? windowState.size.width;
    const restoredH = prev?.height ?? windowState.size.height;
    const newX = cursorX - restoredW / 2;
    const newY = cursorY - 18; // half a title bar
    onResize(windowState.id, restoredW, restoredH);
    onMove(windowState.id, newX, newY);
    if (windowState.isMaximized) onMaximize(windowState.id);
    return { x: newX, y: newY, width: restoredW, height: restoredH };
  };

  // Dragging Title Bar
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus(windowState.id);

    let startRect = {
      x: windowState.position.x,
      y: windowState.position.y,
      width: windowState.size.width,
      height: windowState.size.height,
    };

    if (windowState.isMaximized || windowState.isSnapped) {
      startRect = restoreFromChrome(e.clientX, e.clientY);
      unsnappedAtDragStart.current = true;
    } else {
      unsnappedAtDragStart.current = false;
    }

    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    windowStartRect.current = startRect;
  };

  // Resizing Handles
  const handleResizeStart = (e: React.MouseEvent, dir: ResizeDirection) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent text selection
    if (windowState.isMaximized) return;

    onFocus(windowState.id);
    setIsResizing(true);
    resizeDir.current = dir;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    windowStartRect.current = { 
        x: windowState.position.x, 
        y: windowState.position.y,
        width: windowState.size.width,
        height: windowState.size.height
    };
  };
  
  // Touch Handling for Drag
  const handleTouchStart = (e: React.TouchEvent) => {
      e.stopPropagation();
      onFocus(windowState.id);

      const touch = e.touches[0];
      let startRect = {
        x: windowState.position.x,
        y: windowState.position.y,
        width: windowState.size.width,
        height: windowState.size.height,
      };

      if (windowState.isMaximized || windowState.isSnapped) {
        startRect = restoreFromChrome(touch.clientX, touch.clientY);
        unsnappedAtDragStart.current = true;
      } else {
        unsnappedAtDragStart.current = false;
      }

      setIsDragging(true);
      dragStartPos.current = { x: touch.clientX, y: touch.clientY };
      windowStartRect.current = startRect;
  };

  // Touch Handling for Resize
  const handleResizeTouchStart = (e: React.TouchEvent, dir: ResizeDirection) => {
      e.stopPropagation();
      if (windowState.isMaximized) return;
      
      onFocus(windowState.id);
      setIsResizing(true);
      resizeDir.current = dir;
      const touch = e.touches[0];
      dragStartPos.current = { x: touch.clientX, y: touch.clientY };
      windowStartRect.current = {
          x: windowState.position.x,
          y: windowState.position.y,
          width: windowState.size.width,
          height: windowState.size.height
      };
  };

  useEffect(() => {
    let rafId: number | null = null;
    let pendingEvent: MouseEvent | TouchEvent | null = null;

    const processMove = () => {
      rafId = null;
      const e = pendingEvent;
      if (!e || !dragStartPos.current || !windowStartRect.current) return;

      let clientX, clientY;
      if ('touches' in e) {
          if (e.touches.length === 0) return;
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = (e as MouseEvent).clientX;
          clientY = (e as MouseEvent).clientY;
      }

      if (isDragging) {
        const deltaX = clientX - dragStartPos.current.x;
        const deltaY = clientY - dragStartPos.current.y;

        const newX = windowStartRect.current.x + deltaX;
        const newY = windowStartRect.current.y + deltaY;

        // Check for snap zones and show preview
        const screenWidth = window.innerWidth;

        if (clientX <= SNAP_THRESHOLD) {
          setSnapPreview('left');
        } else if (clientX >= screenWidth - SNAP_THRESHOLD) {
          setSnapPreview('right');
        } else if (clientY <= SNAP_THRESHOLD + MENU_BAR_H) {
          setSnapPreview('full');
        } else {
          setSnapPreview(null);
        }

        onMove(windowState.id, newX, newY);
      } else if (isResizing && resizeDir.current) {
        const deltaX = clientX - dragStartPos.current.x;
        const deltaY = clientY - dragStartPos.current.y;
        const start = windowStartRect.current;
        const dir = resizeDir.current;

        let newWidth = start.width;
        let newHeight = start.height;
        let newX = start.x;
        let newY = start.y;

        const minWidth = WINDOW_MIN_W;
        const minHeight = WINDOW_MIN_H;

        // Calculate Height & Y
        if (dir.includes('n')) {
          const proposedHeight = start.height - deltaY;
          if (proposedHeight >= minHeight) {
            newHeight = proposedHeight;
            newY = start.y + deltaY;
          }
        } else if (dir.includes('s')) {
          newHeight = Math.max(minHeight, start.height + deltaY);
        }

        // Calculate Width & X
        if (dir.includes('w')) {
            const proposedWidth = start.width - deltaX;
            if (proposedWidth >= minWidth) {
                newWidth = proposedWidth;
                newX = start.x + deltaX;
            }
        } else if (dir.includes('e')) {
            newWidth = Math.max(minWidth, start.width + deltaX);
        }

        // Apply Updates
        if (newWidth !== start.width || newHeight !== start.height) {
            onResize(windowState.id, newWidth, newHeight);
        }
        if (newX !== start.x || newY !== start.y) {
            onMove(windowState.id, newX, newY);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      // Stop the page from scrolling while dragging/resizing on touch.
      if ('touches' in e && e.cancelable) e.preventDefault();
      pendingEvent = e;
      if (rafId === null) rafId = requestAnimationFrame(processMove);
    };

    const handleMouseUp = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('changedTouches' in e) {
        clientX = e.changedTouches[0]?.clientX ?? 0;
        clientY = e.changedTouches[0]?.clientY ?? 0;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      // Check for window snap on drag end (read current value via ref)
      if (isDragging && snapPreviewRef.current) {
        // Trigger snap via onMove with snap flag
        onMove(windowState.id, clientX, clientY, true);
        setSnapPreview(null);
        setIsDragging(false);
        setIsResizing(false);
        return;
      }

      // If dragging away from a snapped window without hitting a snap zone, restore size.
      // Skipped when we already restored at drag-start: the position has been following
      // the cursor naturally and re-applying the snap-restore formula would cause a hop.
      if (
        isDragging &&
        windowState.isSnapped &&
        !snapPreviewRef.current &&
        !unsnappedAtDragStart.current
      ) {
        onMove(windowState.id, clientX, clientY, true);
        setIsDragging(false);
        setIsResizing(false);
        return;
      }

      // Check if window is off-screen and bounce it back
      if (isDragging) {
        const padding = 50; // Minimum visible pixels
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const winWidth = windowState.size.width;
        const winHeight = windowState.size.height;
        let newX = windowState.position.x;
        let newY = windowState.position.y;
        let needsBounce = false;

        // Check left boundary (window went too far left)
        if (windowState.position.x + winWidth < padding) {
          newX = padding - winWidth + 100;
          needsBounce = true;
        }
        // Check right boundary (window went too far right)
        if (windowState.position.x > screenWidth - padding) {
          newX = screenWidth - padding - 100;
          needsBounce = true;
        }
        // Check top boundary (window went above viewport)
        if (windowState.position.y < MENU_BAR_H) {
          newY = 50;
          needsBounce = true;
        }
        // Check bottom boundary (window went too far down)
        if (windowState.position.y > screenHeight - padding) {
          newY = screenHeight - padding - 100;
          needsBounce = true;
        }

        if (needsBounce) {
          setIsBouncing(true);
          onMove(windowState.id, newX, newY);
          if (bounceTimer.current) clearTimeout(bounceTimer.current);
          bounceTimer.current = setTimeout(() => setIsBouncing(false), 500);
        }
      }

      setIsDragging(false);
      setIsResizing(false);
      setSnapPreview(null);
      resizeDir.current = null;
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, isResizing, windowState.id, onMove, onResize]);

  if (windowState.isMinimized) return null;

  // --- Animation Style Logic ---
  
  let style: React.CSSProperties = {
      zIndex: windowState.zIndex,
  };

  const isAnimating = animState !== 'open';
  const origin = windowState.originRect;

  // Define transition strings
  const getTransition = () => {
    if (isDragging || isResizing) return 'none';

    // Bounce back animation with spring effect
    if (isBouncing) {
      return 'left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }

    if (animState === 'opening') {
        // Overshoot on transform for the "pop" effect
        // Smooth ease-out on layout properties to follow the transform
        return 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.5s cubic-bezier(0.19, 1, 0.22, 1), top 0.5s cubic-bezier(0.19, 1, 0.22, 1), width 0.5s cubic-bezier(0.19, 1, 0.22, 1), height 0.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.4s ease-out';
    }
    if (animState === 'closing') {
        // Snappy closing
        return 'all 0.3s cubic-bezier(0.32, 0, 0.67, 0)';
    }

    // Default for Maximize/Restore interactions
    return 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
  };

  if (windowState.isMaximized && !isAnimating) {
      style = {
          ...style,
          left: 0,
          top: MENU_BAR_H,
          width: '100%',
          height: `calc(100dvh - ${MENU_BAR_H}px)`,
          borderRadius: 0,
          transform: 'scale(1)',
      };
  } else if (isAnimating) {
      // Base Target (The actual window state)
      const targetStyle: React.CSSProperties = {
          left: windowState.position.x,
          top: windowState.position.y,
          width: windowState.size.width,
          height: windowState.size.height,
          opacity: 1,
          transform: 'scale(1)',
      };

      // Base Origin (Where it comes from/goes to)
      let originStyle: React.CSSProperties = {
          // Default fallback if no origin
          left: windowState.position.x + windowState.size.width / 2,
          top: windowState.position.y + windowState.size.height / 2,
          width: 0,
          height: 0,
          opacity: 0,
          transform: 'scale(0)',
      };

      if (origin) {
          originStyle = {
              left: origin.x,
              top: origin.y,
              width: origin.width,
              height: origin.height,
              opacity: 0,
              transform: 'scale(0)', // Shrink to center of icon
          };
      }

      if (animState === 'closed' || animState === 'closing') {
          style = { ...style, ...originStyle };
      } else {
          // 'opening' state
          style = { ...style, ...targetStyle };
      }
  } else {
      // Normal 'open' State
      style = {
          ...style,
          left: windowState.position.x,
          top: windowState.position.y,
          width: windowState.size.width,
          height: windowState.size.height,
          transform: 'scale(1)',
      };
  }

  // Apply transition
  style.transition = getTransition();

  // Snap preview dimensions
  const getSnapPreviewStyle = (): React.CSSProperties | null => {
    if (!snapPreview) return null;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - MENU_BAR_H - DOCK_H;

    switch (snapPreview) {
      case 'left':
        return { left: 0, top: MENU_BAR_H, width: screenWidth / 2, height: screenHeight };
      case 'right':
        return { left: screenWidth / 2, top: MENU_BAR_H, width: screenWidth / 2, height: screenHeight };
      case 'full':
        return { left: 0, top: MENU_BAR_H, width: screenWidth, height: screenHeight };
      default:
        return null;
    }
  };

  const snapPreviewStyle = getSnapPreviewStyle();

  return (
    <>
      {/* Snap Preview Indicator */}
      {snapPreview && snapPreviewStyle && (
        <div
          className="fixed snap-preview bg-blue-500/20 border-2 border-blue-500 rounded-lg pointer-events-none z-[999]"
          style={snapPreviewStyle}
        />
      )}

      <div
        className={`
          absolute flex flex-col shadow-2xl
          border border-zinc-200 dark:border-zinc-800
          bg-white dark:bg-[#0f0f0f]
          ${!windowState.isMaximized ? 'rounded-lg' : ''}
          ${isAnimating ? 'pointer-events-none overflow-hidden' : ''}
          ${animState === 'opening' ? 'window-spring-enter' : ''}
        `}
        style={style}
        onClick={() => onFocus(windowState.id)}
        role="dialog"
        aria-label={windowState.title}
        aria-modal="false"
        inert={isAnimating}
      >
      {/* Resize Handles — only when not maximized and not animating. Sides are
          edge strips; corners are 24×24 hit areas for reliable touch tapping. */}
      {!windowState.isMaximized && !isAnimating && RESIZE_HANDLES.map(({ dir, className, style }) => (
        <div
          key={dir}
          className={className}
          style={style}
          onMouseDown={(e) => handleResizeStart(e, dir)}
          onTouchStart={(e) => handleResizeTouchStart(e, dir)}
        />
      ))}

      {/* Title Bar */}
      <div 
        className="h-9 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-3 select-none cursor-move shrink-0"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={() => onMaximize(windowState.id)}
      >
        <div className="flex gap-1.5 group relative z-[60]">
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); handleCloseRequest(); }}
            className="rounded-full bg-red-500 hover:bg-red-600 border border-red-600 transition-colors flex items-center justify-center flex-shrink-0"
            style={{ width: '12px', height: '12px', minWidth: '12px', minHeight: '12px' }}
            onTouchEnd={(e) => { e.stopPropagation(); handleCloseRequest(); }}
            aria-label="Close window"
            title="Close"
          >
          </button>

          {/* Minimize */}
          <button
            onClick={(e) => { e.stopPropagation(); onMinimize(windowState.id); }}
            className="rounded-full bg-zinc-300 dark:bg-zinc-700 hover:bg-yellow-400 border border-zinc-400 dark:border-zinc-600 transition-colors flex-shrink-0"
            style={{ width: '12px', height: '12px', minWidth: '12px', minHeight: '12px' }}
            onTouchEnd={(e) => { e.stopPropagation(); onMinimize(windowState.id); }}
            aria-label="Minimize window"
            title="Minimize"
          />

          {/* Maximize */}
          <button
            onClick={(e) => { e.stopPropagation(); onMaximize(windowState.id); }}
            className="rounded-full bg-zinc-300 dark:bg-zinc-700 hover:bg-green-500 border border-zinc-400 dark:border-zinc-600 transition-colors flex-shrink-0"
            style={{ width: '12px', height: '12px', minWidth: '12px', minHeight: '12px' }}
            onTouchEnd={(e) => { e.stopPropagation(); onMaximize(windowState.id); }}
            aria-label={windowState.isMaximized ? "Restore window" : "Maximize window"}
            title={windowState.isMaximized ? "Restore" : "Maximize"}
          />
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 font-bold">
          {windowState.title}
        </span>
        <div className="w-8" />
      </div>

      {/* Content Area */}
        <div
          className="flex-1 overflow-hidden relative bg-white dark:bg-zinc-950"
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setWindowContextMenu({ x: e.clientX, y: e.clientY });
          }}
        >
          {children}
        </div>

        {/* Window Context Menu - rendered via portal to escape transform context */}
        {windowContextMenu && createPortal(
          <>
            {/* Backdrop to close menu */}
            <div
              className="fixed inset-0 z-[200]"
              onClick={() => setWindowContextMenu(null)}
              onContextMenu={(e) => { e.preventDefault(); setWindowContextMenu(null); }}
            />

            {/* Context Menu */}
            <div
              className="fixed z-[201] min-w-[160px] bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-100 rounded-lg backdrop-blur-3xl"
              style={{
                top: Math.min(windowContextMenu.y, window.innerHeight - 180),
                left: Math.min(windowContextMenu.x, window.innerWidth - 180)
              }}
            >
              <div className="flex flex-col gap-1">
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-400 font-bold border-b border-zinc-100 dark:border-zinc-900 mb-1">
                  Window Actions
                </div>

                <button
                  onClick={() => { onMinimize(windowState.id); setWindowContextMenu(null); }}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-black dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded transition-colors group text-left"
                >
                  <Minus size={14} className="group-hover:text-yellow-500 transition-colors" />
                  <span className="font-mono text-xs">Minimize</span>
                </button>

                <button
                  onClick={() => { onMaximize(windowState.id); setWindowContextMenu(null); }}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-black dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded transition-colors group text-left"
                >
                  <Maximize2 size={14} className="group-hover:text-green-500 transition-colors" />
                  <span className="font-mono text-xs">{windowState.isMaximized ? 'Restore' : 'Maximize'}</span>
                </button>

                <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-1 mx-2" />

                <button
                  onClick={() => {
                    // Refresh by re-focusing the window (triggers re-render in some apps)
                    onFocus(windowState.id);
                    setWindowContextMenu(null);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-black dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded transition-colors group text-left"
                >
                  <RotateCcw size={14} className="group-hover:text-blue-500 transition-colors" />
                  <span className="font-mono text-xs">Refresh</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(windowState.title);
                    setWindowContextMenu(null);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-black dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded transition-colors group text-left"
                >
                  <Copy size={14} className="group-hover:text-purple-500 transition-colors" />
                  <span className="font-mono text-xs">Copy Title</span>
                </button>

                <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-1 mx-2" />

                <button
                  onClick={() => { handleCloseRequest(); setWindowContextMenu(null); }}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors group text-left"
                >
                  <X size={14} className="group-hover:text-red-600 transition-colors" />
                  <span className="font-mono text-xs">Close Window</span>
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
      </div>
    </>
  );
};