import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-8 space-y-12 bg-white dark:bg-transparent transition-colors">
      {[1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-8 last:border-0">
          {/* Header Skeleton */}
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="w-48 h-6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
          
          {/* Image Skeleton */}
          <div className="w-full h-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse delay-75"></div>
          
          {/* Text Skeleton */}
          <div className="space-y-3 animate-pulse delay-150">
            <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="w-11/12 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="w-4/5 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>
      ))}
      <div className="h-12 flex items-center justify-center animate-pulse">
         <div className="w-32 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
    </div>
  );
};