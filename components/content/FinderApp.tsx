import React, { useState } from 'react';
import { DesktopItem } from '../../types';
import { Grid, List, LayoutGrid, ChevronRight, Folder } from 'lucide-react';
import { getIconForType, getTypeLabel } from '../../utils/fileTypeMeta';

interface FinderAppProps {
  items: DesktopItem[];
  onItemClick: (item: DesktopItem) => void;
}

type ViewMode = 'icons' | 'list' | 'gallery';

export const FinderApp: React.FC<FinderAppProps> = ({ items, onItemClick }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('icons');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // First click/tap selects; a second activates. Double-click still works for
  // mouse users, but this also makes items openable on touch devices, where
  // double-click events never fire.
  const handleItemClick = (item: DesktopItem) => {
    if (selectedItem === item.id) {
      onItemClick(item);
    } else {
      setSelectedItem(item.id);
    }
  };

  const handleItemDoubleClick = (item: DesktopItem) => {
    onItemClick(item);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1c1c1e]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm">
          <span className="px-2 py-1 text-zinc-700 dark:text-zinc-300">LukaOS</span>
          <ChevronRight size={14} className="text-zinc-400" />
          <span className="px-2 py-1 text-zinc-500 dark:text-zinc-400">Desktop</span>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('icons')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'icons' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''}`}
            title="Icon view"
          >
            <Grid size={14} className="text-zinc-600 dark:text-zinc-400" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''}`}
            title="List view"
          >
            <List size={14} className="text-zinc-600 dark:text-zinc-400" />
          </button>
          <button
            onClick={() => setViewMode('gallery')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'gallery' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''}`}
            title="Gallery view"
          >
            <LayoutGrid size={14} className="text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 border-r border-black/5 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-900/50 p-3 overflow-y-auto">
          <div className="mb-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">Favorites</h4>
            <div className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300">
              <Folder size={16} className="text-red-600" />
              Desktop
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'icons' && (
            <div className="grid grid-cols-4 gap-4">
              {items.map(item => {
                const Icon = getIconForType(item.type);
                const isSelected = selectedItem === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-red-600/5 ring-1 ring-red-600/60'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-red-600' : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}>
                      <Icon size={32} className={isSelected ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'} />
                    </div>
                    <span className={`text-xs text-center line-clamp-2 ${
                      isSelected ? 'text-red-600 dark:text-red-400' : 'text-zinc-700 dark:text-zinc-300'
                    }`}>
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-1">
              {/* Header */}
              <div className="flex items-center px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <span className="flex-1">Name</span>
                <span className="w-24">Type</span>
                <span className="w-32">Modified</span>
              </div>
              {items.map(item => {
                const Icon = getIconForType(item.type);
                const isSelected = selectedItem === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-red-600 text-white'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Icon size={18} className={isSelected ? 'text-white' : 'text-zinc-400'} />
                      <span className="text-sm">{item.title}</span>
                    </div>
                    <span className={`w-24 text-xs ${isSelected ? 'text-white/80' : 'text-zinc-500'}`}>
                      {getTypeLabel(item.type)}
                    </span>
                    <span className={`w-32 text-xs ${isSelected ? 'text-white/80' : 'text-zinc-500'}`}>
                      Today
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === 'gallery' && (
            <div className="grid grid-cols-3 gap-4">
              {items.map(item => {
                const Icon = getIconForType(item.type);
                const isSelected = selectedItem === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    className={`rounded-xl overflow-hidden transition-all ${
                      isSelected ? 'ring-1 ring-red-600/60' : ''
                    }`}
                  >
                    <div className={`aspect-video flex items-center justify-center ${
                      isSelected ? 'bg-red-600/10' : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}>
                      <Icon size={48} className={isSelected ? 'text-red-600' : 'text-zinc-400'} />
                    </div>
                    <div className={`p-3 ${isSelected ? 'bg-red-600/5' : 'bg-white dark:bg-zinc-900'}`}>
                      <p className={`text-sm font-medium truncate ${
                        isSelected ? 'text-red-600 dark:text-red-400' : 'text-zinc-700 dark:text-zinc-300'
                      }`}>
                        {item.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {getTypeLabel(item.type)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900">
        <p className="text-[10px] text-zinc-400">
          {items.length} items
          {selectedItem && ` • "${items.find(i => i.id === selectedItem)?.title}" selected`}
        </p>
      </div>
    </div>
  );
};
