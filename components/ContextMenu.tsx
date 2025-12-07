import React from 'react';
import { ArrowDownAZ, LayoutGrid, RotateCcw } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onSortByName: () => void;
  onSortByType: () => void;
  onRefresh: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ 
  x, y, onClose, onSortByName, onSortByType, onRefresh 
}) => {
  // Prevent menu from going off-screen
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 200);

  return (
    <>
      {/* Invisible backdrop to close menu on click elsewhere */}
      <div 
        className="fixed inset-0 z-[100]" 
        onClick={onClose} 
        onContextMenu={(e) => { e.preventDefault(); onClose(); }} 
      />
      
      <div 
        className="fixed z-[101] min-w-[180px] bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-100 rounded-lg backdrop-blur-3xl"
        style={{ top: adjustedY, left: adjustedX }}
      >
        <div className="flex flex-col gap-1">
          <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-400 font-bold border-b border-zinc-100 dark:border-zinc-900 mb-1">
            Desktop Actions
          </div>
          
          <button 
            onClick={() => { onSortByName(); onClose(); }}
            className="flex items-center gap-3 px-3 py-2 text-sm text-black dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded transition-colors group text-left"
          >
            <ArrowDownAZ size={14} className="group-hover:text-red-600 transition-colors" />
            <span className="font-mono text-xs">Sort by Name</span>
          </button>
          
          <button 
            onClick={() => { onSortByType(); onClose(); }}
            className="flex items-center gap-3 px-3 py-2 text-sm text-black dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded transition-colors group text-left"
          >
            <LayoutGrid size={14} className="group-hover:text-red-600 transition-colors" />
            <span className="font-mono text-xs">Sort by Type</span>
          </button>

          <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-1 mx-2" />

          <button 
            onClick={() => { onRefresh(); onClose(); }}
            className="flex items-center gap-3 px-3 py-2 text-sm text-black dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded transition-colors group text-left"
          >
            <RotateCcw size={14} className="group-hover:text-red-600 transition-colors" />
            <span className="font-mono text-xs">Refresh</span>
          </button>
        </div>
      </div>
    </>
  );
};