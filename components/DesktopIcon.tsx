/**
 * Desktop Icon Component
 *
 * Displays a clickable desktop icon with drag & drop support.
 * Supports custom positioning, accessibility, and animations.
 *
 * @module components/DesktopIcon
 */

import React, { useRef, useState } from 'react';
import { DesktopItem, WindowRect } from '../types';

interface DesktopIconProps {
  item: DesktopItem;
  onDoubleClick: (item: DesktopItem, rect?: WindowRect) => void;
  selected?: boolean;
  isDragging?: boolean;
  customPosition?: { x: number; y: number } | null;
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void;
  onDragEnd?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  item,
  onDoubleClick,
  selected,
  isDragging,
  customPosition,
  onDragStart,
  onDragEnd
}) => {
  const Icon = item.icon;
  const iconRef = useRef<HTMLDivElement>(null);
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDraggingLocal) return; // Prevent double-click during drag

    let rect: WindowRect | undefined;
    if (iconRef.current) {
      const r = iconRef.current.getBoundingClientRect();
      rect = { x: r.left, y: r.top, width: r.width, height: r.height };
    }
    onDoubleClick(item, rect);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDraggingLocal(true);
    onDragStart?.(e);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDraggingLocal) {
      setIsDraggingLocal(false);
      onDragEnd?.(e);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDraggingLocal(true);
    onDragStart?.(e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDraggingLocal) {
      setIsDraggingLocal(false);
      onDragEnd?.(e);
    }
  };

  // Custom position styles
  const positionStyles: React.CSSProperties = customPosition
    ? {
        position: 'absolute',
        left: customPosition.x,
        top: customPosition.y,
        transform: isDragging ? 'scale(1.05)' : undefined,
        opacity: isDragging ? 0.9 : 1,
        zIndex: isDragging ? 1000 : 1,
        transition: isDragging ? 'none' : 'all 0.2s ease',
        pointerEvents: isDragging ? 'none' : 'auto',
      }
    : {};

  return (
    <div
      className={`
        group flex flex-col items-center justify-center p-2 w-28 cursor-pointer rounded-xl
        transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10
        ${selected ? 'bg-black/10 dark:bg-white/20 ring-1 ring-black/20 dark:ring-white/30' : ''}
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      `}
      style={positionStyles}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.stopPropagation()}
      role="button"
      tabIndex={0}
      aria-label={`Open ${item.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleDoubleClick(e as unknown as React.MouseEvent);
        }
      }}
    >
      <div className="relative mb-2">
        <div
          ref={iconRef}
          className={`
            w-14 h-14 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700
            flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform
            ${isDragging ? 'ring-2 ring-blue-500 shadow-2xl' : ''}
          `}
        >
          <Icon className="w-7 h-7 text-black dark:text-white" strokeWidth={1.5} />
        </div>
      </div>
      <span className="text-[11px] font-bold tracking-wider text-center text-black dark:text-zinc-300 uppercase bg-white/50 dark:bg-black/50 px-2 py-1 rounded backdrop-blur-sm truncate w-full shadow-sm">
        {item.title}
      </span>
    </div>
  );
};
