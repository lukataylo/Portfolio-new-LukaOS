import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { NOTES } from '../../src/content/loader';
import type { LoadedNote } from '../../src/content/types';

const formatRelativeDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

interface NoteHeaderProps {
  note: LoadedNote;
}

const NoteHeader: React.FC<NoteHeaderProps> = ({ note }) => (
  <header className="px-8 pt-10 pb-6 max-w-2xl mx-auto w-full">
    <h1 className="text-[34px] font-semibold tracking-tight text-black dark:text-white leading-[1.15]">
      {note.title}
    </h1>
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
      <span>{formatRelativeDate(note.date)}</span>
      {note.readTime && (
        <>
          <span aria-hidden="true">·</span>
          <span>{note.readTime}</span>
        </>
      )}
      {note.author && (
        <>
          <span aria-hidden="true">·</span>
          <span>{note.author}</span>
        </>
      )}
    </div>
    {note.tags && note.tags.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {note.tags.map((tag) => (
          <span
            key={tag}
            className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded"
          >
            #{tag}
          </span>
        ))}
      </div>
    )}
  </header>
);

interface NoteBodyProps {
  note: LoadedNote;
}

/** Renders the compiled MDX with prose styling + inline hero image. */
const NoteBody: React.FC<NoteBodyProps> = ({ note }) => {
  const Component = note.Component;
  return (
    <div className="lukaos-editor prose prose-zinc dark:prose-invert max-w-2xl mx-auto px-8 py-10">
      {note.image && (
        <figure className="post-hero">
          <img src={note.image} alt={note.title} loading="lazy" decoding="async" />
        </figure>
      )}
      <Component />
    </div>
  );
};

/**
 * Read-only blog/notes reader. Posts are sourced from `.mdx` files in
 * `src/content/notes/`. To add a post: create a new `.mdx` file with YAML
 * frontmatter (title, date, excerpt, tags, readTime, image, author) — it will
 * appear in the sidebar automatically on the next build / hot reload.
 */
export const BlogApp: React.FC = () => {
  const [activeSlug, setActiveSlug] = useState<string | null>(NOTES[0]?.slug ?? null);
  const [searchQuery, setSearchQuery] = useState('');

  const activeNote = useMemo(
    () => NOTES.find((n) => n.slug === activeSlug) ?? null,
    [activeSlug],
  );

  const filteredNotes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return NOTES;
    return NOTES.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q) ||
        (n.tags ?? []).some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  return (
    <div className="h-full flex bg-[#f5f5f7] dark:bg-[#1c1c1e]">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-[#f5f5f7] dark:bg-[#2c2c2e]">
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-200/60 dark:bg-zinc-700/50 rounded-lg pl-9 pr-3 py-2 text-sm text-black dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/40"
            />
          </div>
        </div>

        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Notes
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map((note) => {
            const isActive = activeSlug === note.slug;
            return (
              <button
                key={note.slug}
                onClick={() => setActiveSlug(note.slug)}
                className={`w-full text-left px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50 transition-colors ${
                  isActive
                    ? 'bg-red-600/10 border-l-2 border-l-red-600'
                    : 'hover:bg-zinc-200/40 dark:hover:bg-zinc-700/30 border-l-2 border-l-transparent'
                }`}
              >
                <h3
                  className={`truncate text-sm font-semibold ${
                    isActive ? 'text-red-600' : 'text-black dark:text-white'
                  }`}
                >
                  {note.title}
                </h3>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {formatRelativeDate(note.date)}
                </div>
                <p className="mt-1.5 text-[12px] text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-2">
                  {note.excerpt}
                </p>
              </button>
            );
          })}
          {filteredNotes.length === 0 && (
            <div className="px-4 py-10 text-center text-xs text-zinc-400">No matches.</div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          {NOTES.length} notes
        </div>
      </aside>

      {/* Detail */}
      <section className="flex-1 flex flex-col bg-white dark:bg-[#1c1c1e] min-w-0">
        {activeNote ? (
          <div className="flex-1 overflow-y-auto" key={activeNote.slug}>
            <NoteHeader note={activeNote} />
            <NoteBody note={activeNote} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-zinc-400">Select a note.</p>
          </div>
        )}
      </section>
    </div>
  );
};
