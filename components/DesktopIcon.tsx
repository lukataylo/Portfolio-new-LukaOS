import React, { useRef } from 'react';
import { DesktopItem, WindowRect } from '../types';

interface DesktopIconProps {
  item: DesktopItem;
  onDoubleClick: (item: DesktopItem, rect?: WindowRect) => void;
  selected?: boolean;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ item, onDoubleClick, selected }) => {
  const Icon = item.icon;
  const iconRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    let rect: WindowRect | undefined;
    if (iconRef.current) {
        const r = iconRef.current.getBoundingClientRect();
        rect = { x: r.left, y: r.top, width: r.width, height: r.height };
    }
    onDoubleClick(item, rect);
  };

  return (
    <div 
      className={`
        group flex flex-col items-center justify-center p-2 w-28 cursor-pointer rounded-xl
        transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10
        ${selected ? 'bg-black/10 dark:bg-white/20 ring-1 ring-black/20 dark:ring-white/30' : ''}
      `}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => e.stopPropagation()} // Prevent desktop context menu
    >
      <div className="relative mb-2">
        <div ref={iconRef} className="w-14 h-14 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
          <Icon className="w-7 h-7 text-black dark:text-white" strokeWidth={1.5} />
        </div>
      </div>
      <span className="text-[11px] font-bold tracking-wider text-center text-black dark:text-zinc-300 uppercase bg-white/50 dark:bg-black/50 px-2 py-1 rounded backdrop-blur-sm truncate w-full shadow-sm">
        {item.title}
      </span>
    </div>
  );
};