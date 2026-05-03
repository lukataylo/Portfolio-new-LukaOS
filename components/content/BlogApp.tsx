import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { BlogPost } from '../../types';
import {
  Search,
  Plus,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Link as LinkIcon,
  List,
  Quote,
  Code,
} from 'lucide-react';

interface BlogAppProps {
  posts: BlogPost[];
}

interface EditablePost extends BlogPost {
  editedTitle?: string;
  editedContent?: string;
}

const sanitise = (html: string) =>
  DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });

const stripHtml = (html: string): string => {
  if (typeof window === 'undefined') return html;
  const tmp = document.createElement('div');
  tmp.innerHTML = sanitise(html);
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
};

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

interface FormatButtonProps {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}

const FormatButton: React.FC<FormatButtonProps> = ({ onClick, title, children }) => (
  <button
    onMouseDown={(e) => {
      // Prevent button click from stealing focus from contentEditable.
      e.preventDefault();
      onClick();
    }}
    title={title}
    aria-label={title}
    className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors"
  >
    {children}
  </button>
);

const Divider: React.FC = () => (
  <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" aria-hidden="true" />
);

interface EditorProps {
  html: string;
  onChange: (html: string) => void;
  /** Non-editable header rendered above the toolbar (title, date, tags). */
  header?: React.ReactNode;
}

/**
 * Rich-text editor over a contentEditable surface. All edits stay in component
 * state — they are never sent over the network or committed to disk.
 */
const Editor: React.FC<EditorProps> = ({ html, onChange, header }) => {
  const ref = useRef<HTMLDivElement>(null);
  const lastHtml = useRef(html);

  // Sync external html → DOM only when the doc actually changed (e.g., switching notes).
  // Avoid stomping the user's caret on every keystroke.
  useEffect(() => {
    if (!ref.current) return;
    if (html !== lastHtml.current) {
      ref.current.innerHTML = sanitise(html);
      lastHtml.current = html;
    }
  }, [html]);

  // Initial mount
  useEffect(() => {
    if (ref.current && ref.current.innerHTML === '') {
      ref.current.innerHTML = sanitise(html);
      lastHtml.current = html;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (ref.current) {
      const next = ref.current.innerHTML;
      lastHtml.current = next;
      onChange(next);
    }
  }, [onChange]);

  const handleInput = () => {
    if (!ref.current) return;
    const next = ref.current.innerHTML;
    lastHtml.current = next;
    onChange(next);
  };

  const handleLink = () => {
    const url = window.prompt('Link URL', 'https://');
    if (!url) return;
    exec('createLink', url);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Single scroll surface: header → sticky toolbar → editable prose. */}
      <div className="flex-1 overflow-y-auto">
        {header}

        <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur border-y border-zinc-100 dark:border-zinc-800">
          <div className="max-w-2xl mx-auto flex items-center gap-0.5 px-6 py-2 flex-wrap">
            <FormatButton onClick={() => exec('bold')} title="Bold (⌘B)">
              <Bold size={14} />
            </FormatButton>
            <FormatButton onClick={() => exec('italic')} title="Italic (⌘I)">
              <Italic size={14} />
            </FormatButton>
            <FormatButton onClick={() => exec('underline')} title="Underline (⌘U)">
              <Underline size={14} />
            </FormatButton>
            <Divider />
            <FormatButton onClick={() => exec('formatBlock', 'h2')} title="Heading">
              <Heading1 size={14} />
            </FormatButton>
            <FormatButton onClick={() => exec('formatBlock', 'h3')} title="Subheading">
              <Heading2 size={14} />
            </FormatButton>
            <FormatButton onClick={() => exec('formatBlock', 'p')} title="Paragraph">
              <span className="text-[11px] font-mono">¶</span>
            </FormatButton>
            <Divider />
            <FormatButton onClick={handleLink} title="Insert link">
              <LinkIcon size={14} />
            </FormatButton>
            <FormatButton onClick={() => exec('insertUnorderedList')} title="Bulleted list">
              <List size={14} />
            </FormatButton>
            <FormatButton onClick={() => exec('formatBlock', 'blockquote')} title="Quote">
              <Quote size={14} />
            </FormatButton>
            <FormatButton onClick={() => exec('formatBlock', 'pre')} title="Code block">
              <Code size={14} />
            </FormatButton>
          </div>
        </div>

        <div
          ref={ref}
          contentEditable
          onInput={handleInput}
          suppressContentEditableWarning
          spellCheck
          className="lukaos-editor prose prose-zinc dark:prose-invert max-w-2xl mx-auto px-8 py-10 focus:outline-none caret-red-600"
        />
      </div>
    </div>
  );
};

export const BlogApp: React.FC<BlogAppProps> = ({ posts }) => {
  const [activePostId, setActivePostId] = useState<string | null>(posts[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editablePosts, setEditablePosts] = useState<Record<string, EditablePost>>({});
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Initialise editable copies once per posts identity. If the post has a
  // header image, inline it at the top of the content so it lives *inside*
  // the prose flow (and remains editable / removable like any other element)
  // rather than floating above the toolbar.
  useEffect(() => {
    const initial: Record<string, EditablePost> = {};
    posts.forEach((post) => {
      const hasInlineImage = post.content?.toLowerCase().includes('<img');
      const content = post.image && !hasInlineImage
        ? `<figure class="post-hero"><img src="${post.image}" alt="${post.title.replace(/"/g, '&quot;')}" loading="lazy" decoding="async" /></figure>${post.content}`
        : post.content;
      initial[post.id] = { ...post, content };
    });
    setEditablePosts(initial);
  }, [posts]);

  const activePost = activePostId ? editablePosts[activePostId] : null;

  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [posts, searchQuery]);

  const updatePost = (id: string, patch: Partial<EditablePost>) =>
    setEditablePosts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const getDisplayTitle = (post: EditablePost) => post.editedTitle ?? post.title;
  const getDisplayContent = (post: EditablePost) => post.editedContent ?? post.content;

  const previewFor = (post: EditablePost) => stripHtml(getDisplayContent(post)).slice(0, 120);

  return (
    <div className="h-full flex bg-[#f5f5f7] dark:bg-[#1c1c1e]">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-[#f5f5f7] dark:bg-[#2c2c2e]">
        {/* Search */}
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

        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Notes
          </span>
          <button
            className="text-zinc-400 hover:text-red-600 transition-colors"
            title="New note"
            aria-label="New note"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredPosts.map((post) => {
            const ep = editablePosts[post.id] ?? post;
            const isActive = activePostId === post.id;
            const edited = !!(ep.editedTitle || ep.editedContent);
            return (
              <button
                key={post.id}
                onClick={() => setActivePostId(post.id)}
                className={`w-full text-left px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50 transition-colors ${
                  isActive
                    ? 'bg-red-600/10 border-l-2 border-l-red-600'
                    : 'hover:bg-zinc-200/40 dark:hover:bg-zinc-700/30 border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex items-start gap-2">
                  <h3
                    className={`flex-1 min-w-0 truncate text-sm font-semibold ${
                      isActive ? 'text-red-600' : 'text-black dark:text-white'
                    }`}
                  >
                    {getDisplayTitle(ep)}
                  </h3>
                  {edited && (
                    <span
                      className="mt-1 w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"
                      title="Unsaved local edits"
                      aria-label="Edited"
                    />
                  )}
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {formatRelativeDate(post.date)}
                </div>
                <p className="mt-1.5 text-[12px] text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-2">
                  {previewFor(ep)}
                </p>
              </button>
            );
          })}
          {filteredPosts.length === 0 && (
            <div className="px-4 py-10 text-center text-xs text-zinc-400">No matches.</div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          {posts.length} notes · local only
        </div>
      </aside>

      {/* Detail */}
      <section className="flex-1 flex flex-col bg-white dark:bg-[#1c1c1e] min-w-0">
        {activePost ? (
          <Editor
            key={activePost.id}
            html={getDisplayContent(activePost)}
            onChange={(next) => activePostId && updatePost(activePostId, { editedContent: next })}
            header={
              <header className="px-8 pt-10 pb-6 max-w-2xl mx-auto w-full">
                <h1
                  ref={titleRef}
                  contentEditable
                  onInput={() =>
                    activePostId &&
                    updatePost(activePostId, {
                      editedTitle: titleRef.current?.textContent ?? activePost.title,
                    })
                  }
                  suppressContentEditableWarning
                  className="text-[34px] font-semibold tracking-tight text-black dark:text-white leading-[1.15] focus:outline-none caret-red-600"
                >
                  {getDisplayTitle(activePost)}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  <span>{formatRelativeDate(activePost.date)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activePost.readTime}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activePost.author}</span>
                </div>
                {activePost.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {activePost.tags.map((tag) => (
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
            }
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-zinc-400">Select a note.</p>
          </div>
        )}
      </section>
    </div>
  );
};
