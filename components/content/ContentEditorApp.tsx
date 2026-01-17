import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Plus,
  Trash2,
  Save,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Lock,
  LogOut,
  Image,
  Tag,
  Calendar,
  Clock,
  User,
  Layers,
  Library,
  Star
} from 'lucide-react';
import { BlogPost, DesktopItem, ContentSlide, FileType, Book } from '../../types';
import { useAdmin } from '../../contexts/AdminContext';

interface ContentEditorAppProps {
  blogPosts: BlogPost[];
  books: Book[];
  desktopItems: DesktopItem[];
  onUpdateBlogPost: (id: string, updates: Partial<BlogPost>) => void;
  onAddBlogPost: (post: Omit<BlogPost, 'id'>) => BlogPost;
  onDeleteBlogPost: (id: string) => void;
  onUpdateBook: (id: string, updates: Partial<Book>) => void;
  onAddBook: (book: Omit<Book, 'id'>) => Book;
  onDeleteBook: (id: string) => void;
  onUpdateDesktopItem: (id: string, updates: Partial<DesktopItem>) => void;
  onUpdateSlide: (itemId: string, slideIndex: number, updates: Partial<ContentSlide>, isLocked?: boolean) => void;
  onAddSlide: (itemId: string, slide: ContentSlide, isLocked?: boolean) => void;
  onDeleteSlide: (itemId: string, slideIndex: number, isLocked?: boolean) => void;
  onSave: () => boolean;
  onReset: () => void;
}

type EditorSection = 'notes' | 'books' | 'pages' | 'settings';

// Login screen component
const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { authenticate } = useAdmin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticate(password)) {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 border-2 border-black dark:border-white rounded-2xl flex items-center justify-center">
            <Lock size={32} className="text-black dark:text-white" />
          </div>
          <h1 className="text-xl font-bold text-black dark:text-white font-mono uppercase tracking-wider">
            Admin Access
          </h1>
          <p className="text-xs text-zinc-500 mt-2 font-mono">
            Enter password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`
              w-full px-4 py-3 bg-white dark:bg-zinc-900
              border-2 ${error ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'}
              rounded-lg font-mono text-sm
              focus:outline-none focus:border-black dark:focus:border-white
              transition-colors
            `}
            autoFocus
          />

          {error && (
            <p className="text-red-500 text-xs font-mono text-center animate-pulse">
              ACCESS DENIED
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-mono text-sm uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
          >
            Authenticate
          </button>
        </form>

        <p className="text-[10px] text-zinc-400 text-center mt-6 font-mono">
          Press ESC to cancel
        </p>
      </div>
    </div>
  );
};

export const ContentEditorApp: React.FC<ContentEditorAppProps> = ({
  blogPosts,
  books,
  desktopItems,
  onUpdateBlogPost,
  onAddBlogPost,
  onDeleteBlogPost,
  onUpdateBook,
  onAddBook,
  onDeleteBook,
  onUpdateDesktopItem,
  onUpdateSlide,
  onAddSlide,
  onDeleteSlide,
  onSave,
  onReset
}) => {
  const { isAuthenticated, logout } = useAdmin();
  const [activeSection, setActiveSection] = useState<EditorSection>('notes');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const handleSave = () => {
    setSaveStatus('saving');
    const success = onSave();
    setSaveStatus(success ? 'saved' : 'error');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleReset = () => {
    if (confirmReset) {
      onReset();
      setConfirmReset(false);
      setSelectedItemId(null);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  // Filter editable presentations
  const editableItems = desktopItems.filter(item =>
    item.type === FileType.PRESENTATION || item.type === FileType.PROTECTED
  );

  const selectedBlogPost = blogPosts.find(p => p.id === selectedItemId);
  const selectedBook = books.find(b => b.id === selectedItemId);
  const selectedDesktopItem = editableItems.find(i => i.id === selectedItemId);

  const renderNotesEditor = () => {
    if (!selectedBlogPost) {
      return (
        <div className="flex-1 flex items-center justify-center text-zinc-400 font-mono text-sm">
          Select a note to edit or create a new one
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Title</label>
            <input
              type="text"
              value={selectedBlogPost.title}
              onChange={(e) => onUpdateBlogPost(selectedBlogPost.id, { title: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Excerpt</label>
            <textarea
              value={selectedBlogPost.excerpt}
              onChange={(e) => onUpdateBlogPost(selectedBlogPost.id, { excerpt: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                <Calendar size={10} className="inline mr-1" /> Date
              </label>
              <input
                type="text"
                value={selectedBlogPost.date}
                onChange={(e) => onUpdateBlogPost(selectedBlogPost.id, { date: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                <Clock size={10} className="inline mr-1" /> Read Time
              </label>
              <input
                type="text"
                value={selectedBlogPost.readTime}
                onChange={(e) => onUpdateBlogPost(selectedBlogPost.id, { readTime: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
              <Tag size={10} className="inline mr-1" /> Tags (comma separated)
            </label>
            <input
              type="text"
              value={selectedBlogPost.tags.join(', ')}
              onChange={(e) => onUpdateBlogPost(selectedBlogPost.id, {
                tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
              })}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Content (HTML)</label>
            <textarea
              value={selectedBlogPost.content}
              onChange={(e) => onUpdateBlogPost(selectedBlogPost.id, { content: e.target.value })}
              rows={12}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-xs focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderBooksEditor = () => {
    if (!selectedBook) {
      return (
        <div className="flex-1 flex items-center justify-center text-zinc-400 font-mono text-sm">
          Select a book to edit or add a new one
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Title</label>
            <input
              type="text"
              value={selectedBook.title}
              onChange={(e) => onUpdateBook(selectedBook.id, { title: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Author</label>
              <input
                type="text"
                value={selectedBook.author}
                onChange={(e) => onUpdateBook(selectedBook.id, { author: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Category</label>
              <input
                type="text"
                value={selectedBook.category}
                onChange={(e) => onUpdateBook(selectedBook.id, { category: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
              <Star size={10} className="inline mr-1" /> Rating (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={selectedBook.rating}
              onChange={(e) => onUpdateBook(selectedBook.id, { rating: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
              <Image size={10} className="inline mr-1" /> Cover Image URL
            </label>
            <input
              type="text"
              value={selectedBook.cover}
              onChange={(e) => onUpdateBook(selectedBook.id, { cover: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Amazon URL</label>
            <input
              type="text"
              value={selectedBook.amazonUrl}
              onChange={(e) => onUpdateBook(selectedBook.id, { amazonUrl: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Review</label>
            <textarea
              value={selectedBook.review}
              onChange={(e) => onUpdateBook(selectedBook.id, { review: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderPagesEditor = () => {
    if (!selectedDesktopItem) {
      return (
        <div className="flex-1 flex items-center justify-center text-zinc-400 font-mono text-sm">
          Select a page to edit
        </div>
      );
    }

    const isProtected = selectedDesktopItem.type === FileType.PROTECTED;
    const slides = isProtected ? selectedDesktopItem.lockedContent : selectedDesktopItem.content;
    const currentSlide = slides?.[selectedSlideIndex];

    return (
      <div className="flex-1 flex overflow-hidden">
        {/* Slides List */}
        <div className="w-48 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Slides</span>
            <button
              onClick={() => onAddSlide(selectedDesktopItem.id, { title: 'New Slide', body: '' }, isProtected)}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
            >
              <Plus size={14} />
            </button>
          </div>
          {slides?.map((slide, index) => (
            <button
              key={index}
              onClick={() => setSelectedSlideIndex(index)}
              className={`
                w-full p-3 text-left border-b border-zinc-100 dark:border-zinc-900
                ${index === selectedSlideIndex ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'}
                transition-colors
              `}
            >
              <div className="text-xs font-mono truncate">{slide.title || `Slide ${index + 1}`}</div>
            </button>
          ))}
        </div>

        {/* Slide Editor */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentSlide ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  <Layers size={10} className="inline mr-1" /> Slide {selectedSlideIndex + 1}
                </span>
                {(slides?.length || 0) > 1 && (
                  <button
                    onClick={() => {
                      onDeleteSlide(selectedDesktopItem.id, selectedSlideIndex, isProtected);
                      setSelectedSlideIndex(Math.max(0, selectedSlideIndex - 1));
                    }}
                    className="text-red-500 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Title</label>
                <input
                  type="text"
                  value={currentSlide.title}
                  onChange={(e) => onUpdateSlide(selectedDesktopItem.id, selectedSlideIndex, { title: e.target.value }, isProtected)}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                  <Image size={10} className="inline mr-1" /> Image URL
                </label>
                <input
                  type="text"
                  value={currentSlide.image || ''}
                  onChange={(e) => onUpdateSlide(selectedDesktopItem.id, selectedSlideIndex, { image: e.target.value || undefined }, isProtected)}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Body</label>
                <textarea
                  value={currentSlide.body}
                  onChange={(e) => onUpdateSlide(selectedDesktopItem.id, selectedSlideIndex, { body: e.target.value }, isProtected)}
                  rows={10}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white resize-none"
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-400 font-mono text-sm">
              No slides. Add one to get started.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-6 space-y-4">
        <h3 className="text-sm font-mono font-bold text-black dark:text-white uppercase tracking-wider">Data Management</h3>
        <p className="text-xs text-zinc-500 font-mono">
          Content is stored in your browser's localStorage. Changes persist across sessions but are local to this device.
        </p>
        <button
          onClick={handleReset}
          className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all
            ${confirmReset ? 'bg-red-500 text-white' : 'border border-zinc-300 dark:border-zinc-700 hover:border-red-500 hover:text-red-500'}`}
        >
          {confirmReset ? 'Confirm Reset?' : 'Reset to Defaults'}
        </button>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-6 space-y-4">
        <h3 className="text-sm font-mono font-bold text-black dark:text-white uppercase tracking-wider">Session</h3>
        <p className="text-xs text-zinc-500 font-mono">Press Cmd+Shift+E to toggle editor visibility.</p>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono text-xs uppercase tracking-wider hover:border-black dark:hover:border-white transition-colors"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-1">
          {[
            { id: 'notes' as EditorSection, icon: BookOpen, label: 'Notes' },
            { id: 'books' as EditorSection, icon: Library, label: 'Books' },
            { id: 'pages' as EditorSection, icon: FileText, label: 'Pages' },
            { id: 'settings' as EditorSection, icon: RotateCcw, label: 'Settings' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setActiveSection(id); setSelectedItemId(null); setSelectedSlideIndex(0); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all
                ${activeSection === id ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all
            ${saveStatus === 'saved' ? 'bg-green-500 text-white' : saveStatus === 'error' ? 'bg-red-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'}`}
        >
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? <><Check size={14} /> Saved</> : saveStatus === 'error' ? <><X size={14} /> Error</> : <><Save size={14} /> Save</>}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {activeSection !== 'settings' && (
          <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                {activeSection === 'notes' ? 'Notes' : activeSection === 'books' ? 'Books' : 'Pages'}
              </span>
              {activeSection === 'notes' && (
                <button
                  onClick={() => {
                    const newPost = onAddBlogPost({
                      title: 'New Note', excerpt: 'Note excerpt...', content: '<p>Start writing...</p>',
                      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                      readTime: '1 min read', author: 'Luka Dadiani', tags: ['New']
                    });
                    setSelectedItemId(newPost.id);
                  }}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                >
                  <Plus size={14} />
                </button>
              )}
              {activeSection === 'books' && (
                <button
                  onClick={() => {
                    const newBook = onAddBook({
                      title: 'New Book', author: 'Author Name', category: 'Category',
                      rating: 7, cover: '', amazonUrl: '', review: 'Write your review...'
                    });
                    setSelectedItemId(newBook.id);
                  }}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            {activeSection === 'notes' && blogPosts.map(post => (
              <button
                key={post.id}
                onClick={() => setSelectedItemId(post.id)}
                className={`w-full p-4 text-left border-b border-zinc-100 dark:border-zinc-900 group
                  ${selectedItemId === post.id ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'} transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-black dark:text-white truncate">{post.title}</div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-1">{post.date}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteBlogPost(post.id); if (selectedItemId === post.id) setSelectedItemId(null); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </button>
            ))}

            {activeSection === 'books' && books.map(book => (
              <button
                key={book.id}
                onClick={() => setSelectedItemId(book.id)}
                className={`w-full p-4 text-left border-b border-zinc-100 dark:border-zinc-900 group
                  ${selectedItemId === book.id ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'} transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-black dark:text-white truncate">{book.title}</div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-1">{book.author}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteBook(book.id); if (selectedItemId === book.id) setSelectedItemId(null); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </button>
            ))}

            {activeSection === 'pages' && editableItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setSelectedItemId(item.id); setSelectedSlideIndex(0); }}
                className={`w-full p-4 text-left border-b border-zinc-100 dark:border-zinc-900 flex items-center gap-3
                  ${selectedItemId === item.id ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'} transition-colors`}
              >
                {item.type === FileType.PROTECTED && <Lock size={12} className="text-zinc-400" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-black dark:text-white truncate">{item.title}</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-1">
                    {(item.content || item.lockedContent)?.length || 0} slides
                  </div>
                </div>
                <ChevronRight size={14} className="text-zinc-300" />
              </button>
            ))}
          </div>
        )}

        {activeSection === 'notes' && renderNotesEditor()}
        {activeSection === 'books' && renderBooksEditor()}
        {activeSection === 'pages' && renderPagesEditor()}
        {activeSection === 'settings' && renderSettings()}
      </div>
    </div>
  );
};
