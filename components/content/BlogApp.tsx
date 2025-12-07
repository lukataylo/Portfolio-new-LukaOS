import React, { useState, useEffect } from 'react';
import { BlogPost } from '../../types';
import { ArrowLeft, Clock, Calendar, Hash, Heart, Share2, Bookmark } from 'lucide-react';

interface BlogAppProps {
  posts: BlogPost[];
}

export const BlogApp: React.FC<BlogAppProps> = ({ posts }) => {
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  // Simple deep linking listener for hash changes
  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash.startsWith('#/blog/')) {
            const postId = hash.split('#/blog/')[1];
            if (posts.some(p => p.id === postId)) {
                setActivePostId(postId);
            }
        } else if (hash === '#/blog') {
            setActivePostId(null);
        }
    };

    handleHashChange(); // Run on mount
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [posts]);

  const activePost = posts.find(p => p.id === activePostId);

  const toggleLike = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setLikedPosts(prev => 
        prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
      );
  };

  const handlePostClick = (id: string) => {
      window.location.hash = `#/blog/${id}`;
      setActivePostId(id);
  };

  const handleBack = () => {
      window.location.hash = '#/blog';
      setActivePostId(null);
  };

  if (activePost) {
    // --- Detail View ---
    return (
      <div className="h-full bg-white dark:bg-zinc-950 overflow-y-auto transition-colors">
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 flex justify-between items-center">
             <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors text-sm font-mono uppercase tracking-wider"
             >
                <ArrowLeft size={16} /> Back
             </button>
             <div className="flex gap-4">
                 <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" aria-label="Share"><Share2 size={18}/></button>
                 <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" aria-label="Bookmark"><Bookmark size={18}/></button>
             </div>
        </nav>

        {/* Article Content */}
        <article className="max-w-2xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
             {/* Header */}
             <header className="mb-8">
                 <div className="flex flex-wrap gap-2 mb-6">
                    {activePost.tags.map(tag => (
                        <span key={tag} className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 px-3 py-1 rounded-full text-xs font-mono">
                            #{tag}
                        </span>
                    ))}
                 </div>
                 <h1 className="text-3xl md:text-5xl font-bold text-black dark:text-white leading-tight mb-6 font-sans tracking-tight">
                    {activePost.title}
                 </h1>
                 
                 <div className="flex items-center gap-4 border-l-2 border-red-500 pl-4">
                     <div>
                         <p className="text-sm font-bold text-black dark:text-white" rel="author">{activePost.author}</p>
                         <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1 font-mono">
                             <time className="flex items-center gap-1" dateTime={activePost.date}><Calendar size={12}/> {activePost.date}</time>
                             <span className="flex items-center gap-1"><Clock size={12}/> {activePost.readTime}</span>
                         </div>
                     </div>
                 </div>
             </header>

             {activePost.image && (
                 <figure className="w-full h-64 md:h-80 overflow-hidden rounded-xl mb-12 shadow-sm">
                     <img src={activePost.image} alt={activePost.title} className="w-full h-full object-cover" />
                 </figure>
             )}

             {/* Body Text */}
             <div 
                className="prose dark:prose-invert prose-lg max-w-none font-mono text-zinc-800 dark:text-zinc-300 leading-loose"
                dangerouslySetInnerHTML={{ __html: activePost.content }} 
             />

             {/* Footer Interaction */}
             <div className="mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                     <button 
                        onClick={(e) => toggleLike(activePost.id, e)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-full border transition-all
                            ${likedPosts.includes(activePost.id) 
                                ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/10' 
                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'
                            }
                        `}
                     >
                         <Heart size={18} fill={likedPosts.includes(activePost.id) ? "currentColor" : "none"} />
                         <span className="text-sm font-bold">{likedPosts.includes(activePost.id) ? 24 : 23}</span>
                     </button>
                 </div>
                 <div className="text-xs text-zinc-400 font-mono uppercase tracking-widest">
                     End of Transmission
                 </div>
             </div>
        </article>
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-16 border-b border-black dark:border-white pb-4">
             <h1 className="text-4xl font-bold tracking-tighter text-black dark:text-white">
                Engineering<span className="text-red-600">.</span>Log
             </h1>
             <div className="hidden md:flex gap-6 text-xs font-mono uppercase tracking-widest text-zinc-500">
                 <span>Archive</span>
                 <span>RSS</span>
                 <span>Subscribe</span>
             </div>
        </header>

        {/* Post Grid */}
        <div className="space-y-4">
             {posts.map((post) => (
                 <article 
                    key={post.id}
                    onClick={() => handlePostClick(post.id)}
                    className="group relative bg-white dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all cursor-pointer shadow-sm hover:shadow-md"
                 >
                    {/* Hover Indicator */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-black dark:bg-white scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300 rounded-l-lg" />
                    
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1">
                             <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 mb-3">
                                 <span className="text-red-600 font-bold uppercase">{post.tags[0]}</span>
                                 <span>•</span>
                                 <time dateTime={post.date}>{post.date}</time>
                             </div>
                             
                             <h2 className="text-2xl font-bold text-black dark:text-white mb-3 group-hover:text-red-600 transition-colors">
                                 {post.title}
                             </h2>
                             
                             <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 line-clamp-2 font-mono text-sm">
                                 {post.excerpt}
                             </p>
                             
                             <div className="flex items-center justify-between mt-6">
                                 <span className="text-xs text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                     {post.readTime}
                                 </span>
                                 <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1">
                                          Read Article <ArrowLeft className="rotate-180" size={12}/>
                                      </span>
                                 </div>
                             </div>
                        </div>
                    </div>
                 </article>
             ))}
        </div>
      </div>
    </div>
  );
};