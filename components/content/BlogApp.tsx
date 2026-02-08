import React, { useState, useEffect, useRef } from 'react';
import { BlogPost } from '../../types';
import { Search, MoreHorizontal, Plus, Hash, Clock, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface BlogAppProps {
  posts: BlogPost[];
}

interface EditablePost extends BlogPost {
  editedTitle?: string;
  editedContent?: string;
}

export const BlogApp: React.FC<BlogAppProps> = ({ posts }) => {
  const [activePostId, setActivePostId] = useState<string | null>(posts[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editablePosts, setEditablePosts] = useState<Record<string, EditablePost>>({});
  const [isEditing, setIsEditing] = useState(true); // Editable by default
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Initialize editable posts from original posts
  useEffect(() => {
    const initial: Record<string, EditablePost> = {};
    posts.forEach(post => {
      initial[post.id] = { ...post };
    });
    setEditablePosts(initial);
  }, [posts]);

  const activePost = activePostId ? editablePosts[activePostId] : null;

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePostClick = (id: string) => {
    setActivePostId(id);
    setIsEditing(false);
  };

  const handleContentChange = () => {
    if (activePostId && contentRef.current) {
      setEditablePosts(prev => ({
        ...prev,
        [activePostId]: {
          ...prev[activePostId],
          editedContent: contentRef.current?.innerHTML || prev[activePostId].content
        }
      }));
    }
  };

  const handleTitleChange = () => {
    if (activePostId && titleRef.current) {
      setEditablePosts(prev => ({
        ...prev,
        [activePostId]: {
          ...prev[activePostId],
          editedTitle: titleRef.current?.textContent || prev[activePostId].title
        }
      }));
    }
  };

  const getDisplayContent = (post: EditablePost) => {
    return post.editedContent || post.content;
  };

  const getDisplayTitle = (post: EditablePost) => {
    return post.editedTitle || post.title;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    return dateStr;
  };

  return (
    <div className="h-full flex bg-[#f2f2f7] dark:bg-[#1c1c1e]">
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-72 opacity-100'} transition-all duration-200 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-[#f2f2f7] dark:bg-[#2c2c2e] overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-200/60 dark:bg-zinc-700/50 rounded-lg pl-9 pr-3 py-2 text-sm text-black dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            />
          </div>
        </div>

        {/* Folders/Categories */}
        <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Notes</span>
            <button className="text-yellow-600 hover:text-yellow-500">
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredPosts.map((post) => {
            const displayPost = editablePosts[post.id] || post;
            const isActive = activePostId === post.id;
            const hasEdits = displayPost.editedTitle || displayPost.editedContent;

            return (
              <div
                key={post.id}
                onClick={() => handlePostClick(post.id)}
                className={`
                  px-4 py-4 cursor-pointer border-b border-zinc-100 dark:border-zinc-800/50
                  transition-colors
                  ${isActive
                    ? 'bg-yellow-500 text-black'
                    : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-700/30'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm truncate mb-1.5 ${isActive ? 'text-black' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {getDisplayTitle(displayPost)}
                      {hasEdits && <span className="text-yellow-600 ml-1">•</span>}
                    </h3>
                    <div className={`flex items-center gap-2 ${isActive ? 'text-black/70' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      <span className="text-[11px]">{formatDate(post.date)}</span>
                      <span className="text-[11px] truncate">{post.excerpt.slice(0, 35)}...</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{posts.length} Notes</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#1c1c1e]">
        {activePost ? (
          <>
            {/* Content Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#1c1c1e]">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setIsSidebarCollapsed(prev => !prev)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"
                  aria-label={isSidebarCollapsed ? 'Show notes list' : 'Hide notes list'}
                >
                  {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                </button>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock size={12} />
                  <span>{activePost.readTime}</span>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                  {activePost.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded"
                    >
                      <Hash size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>


            {/* Note Content */}
            <div className="flex-1 overflow-y-auto">
              <article className="max-w-2xl mx-auto px-8 py-10">
                {/* Title */}
                <h1
                  ref={titleRef}
                  contentEditable={isEditing}
                  onInput={handleTitleChange}
                  suppressContentEditableWarning
                  className="text-3xl font-bold text-black dark:text-white mb-4 leading-tight focus:outline-none"
                >
                  {getDisplayTitle(activePost)}
                </h1>

                {/* Date & Author */}
                <div className="flex items-center gap-3 text-sm text-zinc-500 mb-10 pb-5 border-b border-zinc-200 dark:border-zinc-700">
                  <span>{activePost.date}</span>
                  <span>•</span>
                  <span>{activePost.author}</span>
                </div>

                {/* Featured Image */}
                {activePost.image && (
                  <figure className="w-full h-56 overflow-hidden rounded-xl mb-10 shadow-sm">
                    <img
                      src={activePost.image}
                      alt={getDisplayTitle(activePost)}
                      className="w-full h-full object-cover"
                    />
                  </figure>
                )}

                {/* Content */}
                <div
                  ref={contentRef}
                  contentEditable={isEditing}
                  onInput={handleContentChange}
                  suppressContentEditableWarning
                  className="prose dark:prose-invert prose-zinc max-w-none prose-headings:font-semibold prose-headings:text-black dark:prose-headings:text-white prose-headings:mt-8 prose-headings:mb-4 prose-h3:text-xl prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:text-base prose-p:mb-5 prose-a:text-yellow-600 prose-a:no-underline hover:prose-a:underline focus:outline-none leading-7"
                  dangerouslySetInnerHTML={{ __html: getDisplayContent(activePost) }}
                />
              </article>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-zinc-400">
              <p className="text-sm">Select a note to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
