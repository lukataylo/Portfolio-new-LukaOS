import React, { useState, useRef, useEffect } from 'react';
import { WindowState } from '../../types';

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
  const [isShaking, setIsShaking] = useState(false);
  const [snapPreview, setSnapPreview] = useState<'left' | 'right' | 'full' | null>(null);

  // Store pre-snap size/position for restoration
  const preSnapState = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // Start in 'closed' state to render the initial frame at the icon's position
  const [animState, setAnimState] = useState<AnimationState>('closed');

  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const windowStartRect = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const resizeDir = useRef<ResizeDirection | null>(null);

  // Shake detection refs
  const lastDragX = useRef<number>(0);
  const shakeDirectionChanges = useRef<number>(0);
  const lastDirection = useRef<'left' | 'right' | null>(null);
  const shakeStartTime = useRef<number>(0);

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
    setAnimState('closing');
    // Wait for animation to finish before actually unmounting
    setTimeout(() => {
        onClose(windowState.id);
    }, 350); // Match closing duration
  };

  // Dragging Title Bar
  const handleMouseDown = (e: React.MouseEvent) => {
    // Allow dragging from maximized/snapped windows (will trigger unsnap)
    if (windowState.isMaximized && !windowState.isSnapped) return;

    e.stopPropagation();
    onFocus(windowState.id);

    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    windowStartRect.current = {
        x: windowState.position.x,
        y: windowState.position.y,
        width: windowState.size.width,
        height: windowState.size.height
    };
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
      // Allow dragging from maximized/snapped windows (will trigger unsnap)
      if (windowState.isMaximized && !windowState.isSnapped) return;
      e.stopPropagation();
      onFocus(windowState.id);

      const touch = e.touches[0];
      setIsDragging(true);
      dragStartPos.current = { x: touch.clientX, y: touch.clientY };
      windowStartRect.current = {
          x: windowState.position.x,
          y: windowState.position.y,
          width: windowState.size.width,
          height: windowState.size.height
      };
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
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!dragStartPos.current || !windowStartRect.current) return;
      
      let clientX, clientY;
      if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = (e as MouseEvent).clientX;
          clientY = (e as MouseEvent).clientY;
      }

      if (isDragging) {
        const deltaX = clientX - dragStartPos.current.x;
        const deltaY = clientY - dragStartPos.current.y;

        // Shake detection logic
        const currentX = windowStartRect.current.x + deltaX;
        const xDiff = currentX - lastDragX.current;
        const currentDirection = xDiff > 5 ? 'right' : xDiff < -5 ? 'left' : null;

        if (currentDirection && currentDirection !== lastDirection.current) {
          // Direction changed
          if (shakeDirectionChanges.current === 0) {
            shakeStartTime.current = Date.now();
          }
          shakeDirectionChanges.current++;
          lastDirection.current = currentDirection;

          // If we detected 6+ direction changes in under 1 second, it's a shake
          const timeSinceStart = Date.now() - shakeStartTime.current;
          if (shakeDirectionChanges.current >= 6 && timeSinceStart < 1000) {
            setIsShaking(true);
            setTimeout(() => {
              handleCloseRequest();
            }, 300);
            // Reset shake detection
            shakeDirectionChanges.current = 0;
            lastDirection.current = null;
          }

          // Reset if too slow
          if (timeSinceStart > 1000) {
            shakeDirectionChanges.current = 1;
            shakeStartTime.current = Date.now();
          }
        }

        lastDragX.current = currentX;

        const newX = windowStartRect.current.x + deltaX;
        const newY = windowStartRect.current.y + deltaY;

        // Check for snap zones and show preview
        const screenWidth = window.innerWidth;
        const snapThreshold = 30;

        if (clientX <= snapThreshold) {
          setSnapPreview('left');
        } else if (clientX >= screenWidth - snapThreshold) {
          setSnapPreview('right');
        } else if (clientY <= snapThreshold + 36) {
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

        const minWidth = 320;
        const minHeight = 200;

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

      // Check for window snap on drag end
      if (isDragging && snapPreview) {
        // Trigger snap via onMove with snap flag
        onMove(windowState.id, clientX, clientY, true);
        setSnapPreview(null);
        setIsDragging(false);
        setIsResizing(false);
        return;
      }

      // If dragging away from a snapped window without hitting a snap zone, restore size
      if (isDragging && windowState.isSnapped && !snapPreview) {
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
        if (windowState.position.y < 36) { // Menu bar height
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
          setTimeout(() => setIsBouncing(false), 500);
        }
      }

      setIsDragging(false);
      setIsResizing(false);
      setSnapPreview(null);
      resizeDir.current = null;

      // Reset shake detection
      shakeDirectionChanges.current = 0;
      lastDirection.current = null;
      lastDragX.current = 0;
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
    };
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
          top: 36, // Below menu bar (36px height)
          width: '100vw',
          height: 'calc(100vh - 36px)', // Full height minus menu bar
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
    const screenHeight = window.innerHeight - 36 - 60; // Minus menu bar and dock

    switch (snapPreview) {
      case 'left':
        return { left: 0, top: 36, width: screenWidth / 2, height: screenHeight };
      case 'right':
        return { left: screenWidth / 2, top: 36, width: screenWidth / 2, height: screenHeight };
      case 'full':
        return { left: 0, top: 36, width: screenWidth, height: screenHeight };
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
          ${isShaking ? 'window-shaking' : ''}
          ${animState === 'opening' ? 'window-spring-enter' : ''}
        `}
        style={style}
        onClick={() => onFocus(windowState.id)}
        role="dialog"
        aria-label={windowState.title}
        aria-modal="false"
      >
      {/* Resize Handles - Only when not maximized and not animating */}
      {!windowState.isMaximized && !isAnimating && (
        <>
            {/* Sides */}
            <div className="absolute top-0 left-0 w-full h-2 cursor-n-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'n')} onTouchStart={(e) => handleResizeTouchStart(e, 'n')} />
            <div className="absolute bottom-0 left-0 w-full h-2 cursor-s-resize z-50" onMouseDown={(e) => handleResizeStart(e, 's')} onTouchStart={(e) => handleResizeTouchStart(e, 's')} />
            <div className="absolute top-0 left-0 w-2 h-full cursor-w-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'w')} onTouchStart={(e) => handleResizeTouchStart(e, 'w')} />
            <div className="absolute top-0 right-0 w-2 h-full cursor-e-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'e')} onTouchStart={(e) => handleResizeTouchStart(e, 'e')} />
            
            {/* Corners */}
            <div className="absolute top-0 left-0 w-6 h-6 cursor-nw-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'nw')} onTouchStart={(e) => handleResizeTouchStart(e, 'nw')} />
            <div className="absolute top-0 right-0 w-6 h-6 cursor-ne-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'ne')} onTouchStart={(e) => handleResizeTouchStart(e, 'ne')} />
            <div className="absolute bottom-0 left-0 w-6 h-6 cursor-sw-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'sw')} onTouchStart={(e) => handleResizeTouchStart(e, 'sw')} />
            <div className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'se')} onTouchStart={(e) => handleResizeTouchStart(e, 'se')} />
        </>
      )}

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
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 border border-red-600 transition-colors flex items-center justify-center group-hover:scale-110 active:scale-90"
            onTouchEnd={(e) => { e.stopPropagation(); handleCloseRequest(); }}
            aria-label="Close window"
            title="Close"
          >
          </button>

          {/* Minimize */}
          <button
            onClick={(e) => { e.stopPropagation(); onMinimize(windowState.id); }}
            className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700 hover:bg-yellow-400 border border-zinc-400 dark:border-zinc-600 transition-colors group-hover:scale-110 active:scale-90"
            onTouchEnd={(e) => { e.stopPropagation(); onMinimize(windowState.id); }}
            aria-label="Minimize window"
            title="Minimize"
          />

          {/* Maximize */}
          <button
            onClick={(e) => { e.stopPropagation(); onMaximize(windowState.id); }}
            className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700 hover:bg-green-500 border border-zinc-400 dark:border-zinc-600 transition-colors group-hover:scale-110 active:scale-90"
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
        <div className="flex-1 overflow-hidden relative bg-white dark:bg-zinc-950">
          {children}
        </div>
      </div>
    </>
  );
};