import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, FileText, BookOpen, Lock, Camera, Map, Briefcase, Library, Terminal, Mail } from 'lucide-react';
import { DesktopItem, FileType } from '../types';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  items: DesktopItem[];
  onSelectItem: (item: DesktopItem) => void;
}

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
    default:
      return FileText;
  }
};

export const Spotlight: React.FC<SpotlightProps> = ({ isOpen, onClose, items, onSelectItem }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter items based on query
  const filteredItems = items.filter(item => {
    if (!query) return true;
    const searchLower = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.seoDescription?.toLowerCase().includes(searchLower) ||
      item.type.toLowerCase().includes(searchLower)
    );
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && filteredItems.length > 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, filteredItems.length]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelectItem(filteredItems[selectedIndex]);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredItems, selectedIndex, onSelectItem, onClose]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Spotlight Container */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[640px] z-[101] px-4 animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-200/50 dark:border-zinc-700/50 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <Search size={20} className="text-zinc-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search files, notes, and more..."
              className="flex-1 bg-transparent text-lg text-black dark:text-white placeholder:text-zinc-400 focus:outline-none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
            {filteredItems.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-zinc-500">No results found</p>
                <p className="text-xs text-zinc-400 mt-1">Try a different search term</p>
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const Icon = getIconForType(item.type);
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectItem(item);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`
                      flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors
                      ${isSelected
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isSelected
                        ? 'bg-white/20'
                        : 'bg-zinc-100 dark:bg-zinc-800'
                      }
                    `}>
                      <Icon size={20} className={isSelected ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm truncate ${isSelected ? 'text-white' : 'text-black dark:text-white'}`}>
                        {item.title}
                      </h4>
                      {item.seoDescription && (
                        <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-white/70' : 'text-zinc-500'}`}>
                          {item.seoDescription}
                        </p>
                      )}
                    </div>
                    <span className={`text-[10px] font-mono uppercase ${isSelected ? 'text-white/60' : 'text-zinc-400'}`}>
                      {item.type.replace('_', ' ')}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span>{filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px]">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px]">↵</kbd>
                  to open
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
