import React from 'react';
import { ContentSlide } from '../../types';

interface PresentationViewerProps {
  slides: ContentSlide[];
}

export const PresentationViewer: React.FC<PresentationViewerProps> = ({ slides }) => {
  return (
    <div className="h-full overflow-y-auto p-8 space-y-12 bg-white dark:bg-transparent transition-colors">
      {slides.map((slide, index) => (
        <div key={index} className="flex flex-col gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-8 last:border-0">
          <div className="flex items-center gap-3">
             <span className="text-red-600 font-bold text-sm font-mono">{(index + 1).toString().padStart(2, '0')}</span>
             <h2 className="text-xl font-bold uppercase tracking-wide text-black dark:text-white">{slide.title}</h2>
          </div>
          
          {slide.image && (
            <div className="w-full h-48 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
            </div>
          )}
          
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-mono whitespace-pre-line">
            {slide.body}
          </p>
        </div>
      ))}
      <div className="h-12 flex items-center justify-center text-zinc-400 dark:text-zinc-600 text-xs uppercase tracking-widest">
        End of Document
      </div>
    </div>
  );
};