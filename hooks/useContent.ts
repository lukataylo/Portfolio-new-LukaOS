import { useState, useEffect, useCallback } from 'react';
import { DesktopItem, ContentSlide, Book } from '../types';
import { DESKTOP_ITEMS } from '../constants';

const STORAGE_KEY = 'lukaos_content';

interface StoredContent {
  books: Book[];
  desktopItems: Partial<DesktopItem>[];
  lastModified: string;
}

const getInitialBooks = (): Book[] => {
  const booksItem = DESKTOP_ITEMS.find((item) => item.id === 'books');
  return booksItem?.books || [];
};

/**
 * Local CMS state for the (Konami-code) admin editor. Persists books and
 * presentation slides to localStorage. Notes/blog posts live in MDX files
 * under `src/content/notes/` and are not editable through this hook.
 */
export const useContent = () => {
  const [books, setBooks] = useState<Book[]>(getInitialBooks());
  const [desktopItems, setDesktopItems] = useState<DesktopItem[]>(DESKTOP_ITEMS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredContent = JSON.parse(stored);

        if (parsed.books && parsed.books.length > 0) {
          setBooks(parsed.books);
        }

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

  const saveContent = useCallback(() => {
    try {
      const serializedItems = desktopItems.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        lockedContent: item.lockedContent,
        seoDescription: item.seoDescription,
        password: item.password,
      }));

      const content: StoredContent = {
        books,
        desktopItems: serializedItems,
        lastModified: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
      return true;
    } catch (e) {
      console.error('Failed to save content:', e);
      return false;
    }
  }, [books, desktopItems]);

  // Book operations
  const addBook = useCallback((book: Omit<Book, 'id'>) => {
    const newBook: Book = { ...book, id: `book-${Date.now()}` };
    setBooks((prev) => [newBook, ...prev]);
    return newBook;
  }, []);

  const updateBook = useCallback((id: string, updates: Partial<Book>) => {
    setBooks((prev) => prev.map((book) => (book.id === id ? { ...book, ...updates } : book)));
  }, []);

  const deleteBook = useCallback((id: string) => {
    setBooks((prev) => prev.filter((book) => book.id !== id));
  }, []);

  // Desktop item operations (presentations / case studies)
  const updateDesktopItem = useCallback((id: string, updates: Partial<DesktopItem>) => {
    setDesktopItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const updateSlide = useCallback(
    (itemId: string, slideIndex: number, updates: Partial<ContentSlide>, isLocked: boolean = false) => {
      setDesktopItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          const contentKey = isLocked ? 'lockedContent' : 'content';
          const content = item[contentKey] ? [...item[contentKey]!] : [];
          if (content[slideIndex]) {
            content[slideIndex] = { ...content[slideIndex], ...updates };
          }
          return { ...item, [contentKey]: content };
        }),
      );
    },
    [],
  );

  const addSlide = useCallback((itemId: string, slide: ContentSlide, isLocked: boolean = false) => {
    setDesktopItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const contentKey = isLocked ? 'lockedContent' : 'content';
        const content = item[contentKey] ? [...item[contentKey]!, slide] : [slide];
        return { ...item, [contentKey]: content };
      }),
    );
  }, []);

  const deleteSlide = useCallback((itemId: string, slideIndex: number, isLocked: boolean = false) => {
    setDesktopItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const contentKey = isLocked ? 'lockedContent' : 'content';
        const content = item[contentKey]?.filter((_, i) => i !== slideIndex) || [];
        return { ...item, [contentKey]: content };
      }),
    );
  }, []);

  const resetToDefaults = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setBooks(getInitialBooks());
    setDesktopItems(DESKTOP_ITEMS);
  }, []);

  // Surface books on the Library item so dock previews / call sites work.
  const getDesktopItemsWithContent = useCallback((): DesktopItem[] => {
    return desktopItems.map((item) => {
      if (item.id === 'books') return { ...item, books };
      return item;
    });
  }, [desktopItems, books]);

  return {
    books,
    desktopItems: getDesktopItemsWithContent(),
    isLoaded,
    saveContent,
    addBook,
    updateBook,
    deleteBook,
    updateDesktopItem,
    updateSlide,
    addSlide,
    deleteSlide,
    resetToDefaults,
  };
};
