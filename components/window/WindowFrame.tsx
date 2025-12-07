import React, { useState, useRef, useEffect } from 'react';
import { WindowState } from '../../types';

interface WindowFrameProps {
  windowState: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
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
  
  // Start in 'closed' state to render the initial frame at the icon's position
  const [animState, setAnimState] = useState<AnimationState>('closed');
  
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const windowStartRect = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const resizeDir = useRef<ResizeDirection | null>(null);

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
    if (windowState.isMaximized) return;
    
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
      if (windowState.isMaximized) return;
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
        
        onMove(
          windowState.id,
          windowStartRect.current.x + deltaX,
          windowStartRect.current.y + deltaY
        );
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

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
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
          top: 0,
          width: '100vw',
          height: '100vh',
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

  return (
    <div
      className={`
        absolute flex flex-col shadow-2xl 
        border border-zinc-200 dark:border-zinc-800 
        bg-white dark:bg-[#0f0f0f] 
        ${!windowState.isMaximized ? 'rounded-lg' : ''}
        ${isAnimating ? 'pointer-events-none overflow-hidden' : ''}
      `}
      style={style}
      onClick={() => onFocus(windowState.id)}
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
          >
          </button>
          
          {/* Minimize */}
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(windowState.id); }}
            className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700 hover:bg-yellow-400 border border-zinc-400 dark:border-zinc-600 transition-colors group-hover:scale-110 active:scale-90" 
            onTouchEnd={(e) => { e.stopPropagation(); onMinimize(windowState.id); }}
          />
          
          {/* Maximize */}
          <button 
            onClick={(e) => { e.stopPropagation(); onMaximize(windowState.id); }}
            className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700 hover:bg-green-500 border border-zinc-400 dark:border-zinc-600 transition-colors group-hover:scale-110 active:scale-90" 
            onTouchEnd={(e) => { e.stopPropagation(); onMaximize(windowState.id); }}
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
  );
};