import React, { useState, useMemo } from 'react';
import { ArrowLeft, Star, ExternalLink } from 'lucide-react';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  rating: number; // out of 10
  cover: string;
  amazonUrl: string;
  review: string;
}

interface BooksAppProps {
  books: Book[];
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-4 rounded-sm ${
              i < rating
                ? 'bg-zinc-800 dark:bg-zinc-200'
                : 'bg-zinc-200 dark:bg-zinc-700'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-mono text-zinc-500">{rating}/10</span>
    </div>
  );
};

export const BooksApp: React.FC<BooksAppProps> = ({ books }) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Group books by category
  const booksByCategory = useMemo(() => {
    const grouped: Record<string, Book[]> = {};
    books.forEach(book => {
      if (!grouped[book.category]) {
        grouped[book.category] = [];
      }
      grouped[book.category].push(book);
    });
    return grouped;
  }, [books]);

  const categories = Object.keys(booksByCategory).sort();

  if (selectedBook) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-[#1c1c1e]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setSelectedBook(null)}
            className="flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back</span>
          </button>
        </div>

        {/* Book Detail */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto px-6 py-10">
            {/* Cover */}
            <div className="flex justify-center mb-8">
              <div className="w-40 h-60 rounded-md overflow-hidden shadow-2xl bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={selectedBook.cover}
                  alt={selectedBook.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
                {selectedBook.title}
              </h1>
              <p className="text-base text-zinc-500 mb-4">
                {selectedBook.author}
              </p>
              <div className="flex items-center justify-center gap-3 mb-5">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  {selectedBook.category}
                </span>
              </div>
              <div className="flex justify-center mb-6">
                <StarRating rating={selectedBook.rating} />
              </div>
              <a
                href={selectedBook.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-sm font-medium rounded-full hover:opacity-80 transition-opacity"
              >
                <span>View on Amazon</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Review */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8">
              <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-4">Review</h2>
              <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                {selectedBook.review}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1c1c1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h1 className="text-lg font-semibold text-black dark:text-white">Library</h1>
        <span className="text-xs text-zinc-400">{books.length} books</span>
      </div>

      {/* Books by Category */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-6 space-y-10">
          {categories.map(category => (
            <section key={category}>
              {/* Category Header */}
              <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-4">
                {category}
              </h2>

              {/* Books Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {booksByCategory[category].map((book) => (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className="group text-left focus:outline-none"
                  >
                    {/* Cover */}
                    <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-sm group-hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Rating */}
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[10px] font-mono text-white">
                        {book.rating}/10
                      </div>
                    </div>

                    {/* Title & Author */}
                    <div className="mt-2">
                      <p className="text-xs font-medium text-black dark:text-white line-clamp-1">
                        {book.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">
                        {book.author}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
