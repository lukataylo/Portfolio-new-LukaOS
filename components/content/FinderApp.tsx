import React, { useState } from 'react';
import { DesktopItem, FileType } from '../../types';
import {
  Grid,
  List,
  LayoutGrid,
  FileText,
  Lock,
  BookOpen,
  Library,
  Terminal,
  Mail,
  Map,
  ExternalLink,
  ChevronRight,
  Folder
} from 'lucide-react';

interface FinderAppProps {
  items: DesktopItem[];
  onItemClick: (item: DesktopItem) => void;
}

type ViewMode = 'icons' | 'list' | 'gallery';

const getIconForType = (type: FileType) => {
  switch (type) {
    case FileType.PRESENTATION:
      return FileText;
    case FileType.PROTECTED:
      return Lock;
    case FileType.BLOG:
      return BookOpen;
    case FileType.BOOKS:
      return Library;
    case FileType.TERMINAL:
      return Terminal;
    case FileType.MAIL:
      return Mail;
    case FileType.SITEMAP:
      return Map;
    case FileType.EXTERNAL_LINK:
    case FileType.LINK:
      return ExternalLink;
    default:
      return FileText;
  }
};

const getTypeLabel = (type: FileType) => {
  switch (type) {
    case FileType.PRESENTATION:
      return 'Presentation';
    case FileType.PROTECTED:
      return 'Protected';
    case FileType.BLOG:
      return 'Notes';
    case FileType.BOOKS:
      return 'Library';
    case FileType.TERMINAL:
      return 'Terminal';
    case FileType.MAIL:
      return 'Mail';
    case FileType.SITEMAP:
      return 'Sitemap';
    case FileType.EXTERNAL_LINK:
      return 'External Link';
    case FileType.LINK:
      return 'Link';
    default:
      return 'File';
  }
};

export const FinderApp: React.FC<FinderAppProps> = ({ items, onItemClick }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('icons');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>(['LukaOS']);

  const handleItemClick = (item: DesktopItem) => {
    setSelectedItem(item.id);
  };

  const handleItemDoubleClick = (item: DesktopItem) => {
    onItemClick(item);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1c1c1e]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm">
          {currentPath.map((segment, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight size={14} className="text-zinc-400" />}
              <button className="px-2 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300 transition-colors">
                {segment}
              </button>
            </React.Fragment>
          ))}
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
        <div className="w-48 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-3 overflow-y-auto">
          <div className="mb-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">Favorites</h4>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-sm text-zinc-700 dark:text-zinc-300">
              <Folder size={16} className="text-blue-500" />
              Desktop
            </button>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">Tags</h4>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-xs text-zinc-600 dark:text-zinc-400">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Work
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-xs text-zinc-600 dark:text-zinc-400">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Personal
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-xs text-zinc-600 dark:text-zinc-400">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Projects
              </button>
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
                        ? 'bg-blue-500/10 ring-2 ring-blue-500'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-blue-500' : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}>
                      <Icon size={32} className={isSelected ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'} />
                    </div>
                    <span className={`text-xs text-center line-clamp-2 ${
                      isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'
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
                        ? 'bg-blue-500 text-white'
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
                      isSelected ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className={`aspect-video flex items-center justify-center ${
                      isSelected ? 'bg-blue-500/20' : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}>
                      <Icon size={48} className={isSelected ? 'text-blue-500' : 'text-zinc-400'} />
                    </div>
                    <div className={`p-3 ${isSelected ? 'bg-blue-500/10' : 'bg-white dark:bg-zinc-900'}`}>
                      <p className={`text-sm font-medium truncate ${
                        isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'
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
      <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <p className="text-[10px] text-zinc-400">
          {items.length} items
          {selectedItem && ` • "${items.find(i => i.id === selectedItem)?.title}" selected`}
        </p>
      </div>
    </div>
  );
};
