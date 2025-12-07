import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, ExternalLink, Lock, AlertTriangle, Github, Linkedin, Twitter, MapPin, Link as LinkIcon, Briefcase } from 'lucide-react';

interface BrowserAppProps {
  initialUrl: string;
}

export const BrowserApp: React.FC<BrowserAppProps> = ({ initialUrl }) => {
  const [url, setUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset state when url prop changes
  useEffect(() => {
    setUrl(initialUrl);
    setIsLoading(true);
  }, [initialUrl]);

  // Simulate loading delay for mock content
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isLoading) {
        timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
        // Force reload by re-assigning src
        iframeRef.current.src = iframeRef.current.src;
    }
  };

  const getDomain = (urlString: string) => {
    try {
        return new URL(urlString).hostname;
    } catch {
        return '';
    }
  };

  const renderMockContent = () => {
    const domain = getDomain(url);

    if (domain.includes('github.com')) {
        const username = url.split('github.com/')[1]?.split('/')[0] || 'lukataylo';
        return (
            <div className="flex flex-col p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                        <Github className="w-10 h-10 text-black dark:text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <h1 className="text-2xl font-bold text-black dark:text-white">Luka Dadiani</h1>
                        <p className="text-zinc-500 text-sm font-mono">@{username}</p>
                        <p className="text-black dark:text-zinc-300 max-w-lg">
                            Product Manager & Senior Product Designer. Building user-centred, data-informed products.
                        </p>
                        <div className="flex gap-4 text-xs text-zinc-500 pt-2">
                            <span className="flex items-center gap-1"><MapPin size={12}/> London, UK</span>
                            <span className="flex items-center gap-1"><LinkIcon size={12}/> portfolio</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['nothing-os-portfolio', 'design-system', 'react-components', 'product-toolkit'].map((repo, i) => (
                        <div key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer group">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-blue-600 text-sm group-hover:underline">{repo}</span>
                                <span className="text-xs border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-full text-zinc-500">Public</span>
                            </div>
                            <p className="text-xs text-zinc-500 mb-4">A project showcasing modern web development practices.</p>
                            <div className="flex items-center gap-3 text-xs text-zinc-400">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div> TypeScript
                                </div>
                                <span>★ {(i + 1) * 8}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded hover:opacity-80 transition-opacity"
                    >
                        <ExternalLink size={14} />
                        View Full Profile on GitHub
                    </a>
                </div>
            </div>
        );
    }

    if (domain.includes('twitter.com') || domain.includes('x.com')) {
        const username = url.split('/').pop() || 'lukadadiani';
        return (
            <div className="flex flex-col max-w-2xl mx-auto border-x border-zinc-200 dark:border-zinc-800 min-h-full bg-white dark:bg-black">
                <div className="h-32 bg-zinc-200 dark:bg-zinc-800 relative mb-12">
                     <div className="absolute -bottom-8 left-4 w-20 h-20 rounded-full bg-white dark:bg-black p-1">
                        <div className="w-full h-full rounded-full bg-black dark:bg-white flex items-center justify-center">
                            <Twitter className="text-white dark:text-black w-8 h-8"/>
                        </div>
                     </div>
                </div>
                <div className="px-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h1 className="font-bold text-xl text-black dark:text-white">Luka Dadiani</h1>
                    <p className="text-zinc-500 text-sm">@{username}</p>
                    <p className="mt-2 text-black dark:text-zinc-200 text-sm">
                        Product Manager & Designer | Building digital experiences | London
                    </p>
                    <div className="flex gap-4 mt-3 text-sm text-zinc-500">
                        <span><b className="text-black dark:text-white">500+</b> Following</span>
                        <span><b className="text-black dark:text-white">1K+</b> Followers</span>
                    </div>
                </div>
                {[
                    "Just shipped a new portfolio OS. Check it out! #react #design",
                    "Working on some complex drag and drop physics today. The web is evolving.",
                    "Exploring the intersection of product management and design systems."
                ].map((tweet, i) => (
                    <div key={i} className="p-4 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
                                <Twitter size={16} className="text-zinc-500" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1 text-sm">
                                    <span className="font-bold text-black dark:text-white">Luka Dadiani</span>
                                    <span className="text-zinc-500">@{username} · {i + 1}h</span>
                                </div>
                                <p className="text-black dark:text-zinc-300 text-sm mt-1">{tweet}</p>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="p-4">
                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full hover:opacity-80 transition-opacity"
                    >
                        <ExternalLink size={14} />
                        View Full Profile on X
                    </a>
                </div>
            </div>
        );
    }

    if (domain.includes('linkedin.com')) {
        return (
            <div className="bg-[#f3f2ef] dark:bg-black min-h-full p-4 flex flex-col items-center">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl overflow-hidden mb-4">
                    <div className="h-24 bg-blue-600 relative">
                        <div className="absolute -bottom-10 left-6 w-24 h-24 rounded-full border-4 border-white dark:border-zinc-900 bg-zinc-200 flex items-center justify-center">
                             <Linkedin className="w-10 h-10 text-blue-700"/>
                        </div>
                    </div>
                    <div className="pt-12 px-6 pb-6">
                        <h1 className="text-xl font-bold text-black dark:text-white">Luka Dadiani</h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Product Manager | Senior Product Designer | UX Strategy</p>
                        <p className="text-xs text-zinc-500 mt-1">London, United Kingdom</p>
                        <div className="mt-4 flex gap-2">
                            <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors"
                            >
                                Connect
                            </a>
                            <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="border border-blue-600 text-blue-600 dark:text-blue-400 px-4 py-1 rounded-full text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            >
                                Message
                            </a>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl p-6">
                    <h2 className="text-lg font-bold text-black dark:text-white mb-4">Experience</h2>
                    {[
                        { title: 'Product Manager', company: 'xTrade (Howden Group)', period: 'Nov 2021 - Present' },
                        { title: 'Senior UX Designer', company: 'Hyperion X', period: 'Sep 2018 - May 2022' }
                    ].map((job, i) => (
                        <div key={i} className="flex gap-4 mb-4 last:mb-0">
                            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-zinc-500"/>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-black dark:text-white">{job.title}</h3>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400">{job.company}</p>
                                <p className="text-xs text-zinc-500">{job.period}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors"
                    >
                        <ExternalLink size={14} />
                        View Full Profile on LinkedIn
                    </a>
                </div>
            </div>
        );
    }

    // Return null to fall back to iframe for other sites
    return null;
  };

  const mockContent = renderMockContent();

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950">
        <div className="flex gap-2 text-zinc-400">
           <ArrowLeft size={14} className="hover:text-black dark:hover:text-white transition-colors cursor-pointer" />
           <ArrowRight size={14} className="hover:text-black dark:hover:text-white transition-colors cursor-pointer" />
           <RotateCcw size={14} className="hover:text-black dark:hover:text-white transition-colors cursor-pointer" onClick={handleRefresh}/>
        </div>
        
        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono shadow-sm group focus-within:border-red-600 transition-colors">
            <Lock size={10} className="text-emerald-500" />
            <input 
                type="text" 
                value={url} 
                readOnly 
                className="flex-1 bg-transparent outline-none text-zinc-600 dark:text-zinc-400 truncate selection:bg-red-200 selection:text-red-900"
            />
        </div>

        <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-red-600 transition-colors"
            title="Open in actual browser"
        >
            <ExternalLink size={16} />
        </a>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-white dark:bg-black overflow-hidden overflow-y-auto">
        {isLoading && (
            <div className="absolute top-0 left-0 w-full h-0.5 bg-zinc-100 dark:bg-zinc-800 z-30">
                 <div className="h-full bg-red-600 w-1/3 animate-[loading_1s_ease-in-out_infinite]"></div>
            </div>
        )}

        {/* If we have a custom mock view, render it */}
        {mockContent ? (
            <div className="h-full w-full bg-white dark:bg-black overflow-y-auto">
                {mockContent}
            </div>
        ) : (
            /* Fallback for regular sites (or if iframe works) */
            <>
                {/* Fallback Background (Visible if iframe is transparent or blocked) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 z-0 p-8 text-center select-none">
                    <AlertTriangle size={32} className="mb-4 opacity-50" />
                    <p className="text-xs uppercase tracking-widest font-bold mb-2">Connection Refused</p>
                    <p className="font-mono text-[10px] max-w-md leading-relaxed mb-4">
                        The remote site ({getDomain(url)}) refused the connection. <br/>
                        Many major platforms block embedding in virtual browsers.
                    </p>
                    <a 
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-600 hover:text-white transition-colors text-xs font-mono rounded border border-zinc-200 dark:border-zinc-700"
                    >
                        Open in New Tab
                    </a>
                </div>
                
                <iframe 
                    ref={iframeRef}
                    src={url} 
                    className="w-full h-full relative z-10 bg-white dark:bg-zinc-900"
                    onLoad={() => setIsLoading(false)}
                    title="Browser View"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
            </>
        )}
      </div>
      
      <style>{`
        @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};