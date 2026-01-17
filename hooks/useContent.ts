import { useState, useEffect, useCallback } from 'react';
import { BlogPost, DesktopItem, ContentSlide, Book } from '../types';
import { DESKTOP_ITEMS } from '../constants';

const STORAGE_KEY = 'lukaos_content';

interface StoredContent {
  blogPosts: BlogPost[];
  books: Book[];
  desktopItems: Partial<DesktopItem>[];
  lastModified: string;
}

// Extract initial blog posts from desktop items
const getInitialBlogPosts = (): BlogPost[] => {
  const blogItem = DESKTOP_ITEMS.find(item => item.id === 'blog');
  return blogItem?.blogPosts || [];
};

// Extract initial books from desktop items
const getInitialBooks = (): Book[] => {
  const booksItem = DESKTOP_ITEMS.find(item => item.id === 'books');
  return booksItem?.books || [];
};

export const useContent = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(getInitialBlogPosts());
  const [books, setBooks] = useState<Book[]>(getInitialBooks());
  const [desktopItems, setDesktopItems] = useState<DesktopItem[]>(DESKTOP_ITEMS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load content from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredContent = JSON.parse(stored);

        // Merge stored blog posts
        if (parsed.blogPosts && parsed.blogPosts.length > 0) {
          setBlogPosts(parsed.blogPosts);
        }

        // Merge stored books
        if (parsed.books && parsed.books.length > 0) {
          setBooks(parsed.books);
        }

        // Merge stored desktop items - keep icons from original, update content only
        if (parsed.desktopItems && parsed.desktopItems.length > 0) {
          const mergedItems = DESKTOP_ITEMS.map((originalItem) => {
            const storedItem = parsed.desktopItems.find((s) => s.id === originalItem.id);
            if (storedItem) {
              return {
                ...originalItem,
                content: storedItem.content || originalItem.content,
                lockedContent: storedItem.lockedContent || originalItem.lockedContent,
                title: storedItem.title || originalItem.title,
                seoDescription: storedItem.seoDescription || originalItem.seoDescription,
                password: storedItem.password || originalItem.password,
              };
            }
            return originalItem;
          });
          setDesktopItems(mergedItems);
        }
      }
    } catch (e) {
      console.error('Failed to load content from storage:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save content to localStorage
  const saveContent = useCallback(() => {
    try {
      // Serialize desktop items without icon functions
      const serializedItems = desktopItems.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        lockedContent: item.lockedContent,
        seoDescription: item.seoDescription,
        password: item.password,
      }));

      const content: StoredContent = {
        blogPosts,
        books,
        desktopItems: serializedItems,
        lastModified: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
      return true;
    } catch (e) {
      console.error('Failed to save content:', e);
      return false;
    }
  }, [blogPosts, books, desktopItems]);

  // Blog post operations
  const addBlogPost = useCallback((post: Omit<BlogPost, 'id'>) => {
    const newPost: BlogPost = {
      ...post,
      id: `post-${Date.now()}`
    };
    setBlogPosts(prev => [newPost, ...prev]);
    return newPost;
  }, []);

  const updateBlogPost = useCallback((id: string, updates: Partial<BlogPost>) => {
    setBlogPosts(prev => prev.map(post =>
      post.id === id ? { ...post, ...updates } : post
    ));
  }, []);

  const deleteBlogPost = useCallback((id: string) => {
    setBlogPosts(prev => prev.filter(post => post.id !== id));
  }, []);

  // Book operations
  const addBook = useCallback((book: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...book,
      id: `book-${Date.now()}`
    };
    setBooks(prev => [newBook, ...prev]);
    return newBook;
  }, []);

  const updateBook = useCallback((id: string, updates: Partial<Book>) => {
    setBooks(prev => prev.map(book =>
      book.id === id ? { ...book, ...updates } : book
    ));
  }, []);

  const deleteBook = useCallback((id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  }, []);

  // Desktop item operations (for presentations/case studies)
  const updateDesktopItem = useCallback((id: string, updates: Partial<DesktopItem>) => {
    setDesktopItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const updateSlide = useCallback((itemId: string, slideIndex: number, updates: Partial<ContentSlide>, isLocked: boolean = false) => {
    setDesktopItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;

      const contentKey = isLocked ? 'lockedContent' : 'content';
      const content = item[contentKey] ? [...item[contentKey]!] : [];
      if (content[slideIndex]) {
        content[slideIndex] = { ...content[slideIndex], ...updates };
      }
      return { ...item, [contentKey]: content };
    }));
  }, []);

  const addSlide = useCallback((itemId: string, slide: ContentSlide, isLocked: boolean = false) => {
    setDesktopItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const contentKey = isLocked ? 'lockedContent' : 'content';
      const content = item[contentKey] ? [...item[contentKey]!, slide] : [slide];
      return { ...item, [contentKey]: content };
    }));
  }, []);

  const deleteSlide = useCallback((itemId: string, slideIndex: number, isLocked: boolean = false) => {
    setDesktopItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const contentKey = isLocked ? 'lockedContent' : 'content';
      const content = item[contentKey]?.filter((_, i) => i !== slideIndex) || [];
      return { ...item, [contentKey]: content };
    }));
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setBlogPosts(getInitialBlogPosts());
    setBooks(getInitialBooks());
    setDesktopItems(DESKTOP_ITEMS);
  }, []);

  // Get desktop items with updated blog posts and books
  const getDesktopItemsWithContent = useCallback((): DesktopItem[] => {
    return desktopItems.map(item => {
      if (item.id === 'blog') {
        return { ...item, blogPosts };
      }
      if (item.id === 'books') {
        return { ...item, books };
      }
      return item;
    });
  }, [desktopItems, blogPosts, books]);

  return {
    blogPosts,
    books,
    desktopItems: getDesktopItemsWithContent(),
    isLoaded,
    saveContent,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    addBook,
    updateBook,
    deleteBook,
    updateDesktopItem,
    updateSlide,
    addSlide,
    deleteSlide,
    resetToDefaults
  };
};
