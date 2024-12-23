import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { VideoEmbed } from './VideoEmbed';
import type { MediaItem } from './MediaUpload';

interface GalleryProps {
  items: MediaItem[];
  className?: string;
}

export function Gallery({ items, className = '' }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? items.length - 1 : selectedIndex - 1);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === items.length - 1 ? 0 : selectedIndex + 1);
  };

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
        {items.map((item, index) => (
          <div 
            key={index}
            className="relative aspect-square cursor-pointer group"
            onClick={() => setSelectedIndex(index)}
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.title || ''}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <VideoEmbed
                videoId={item.url}
                title={item.title}
                className="h-full"
              />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {item.title || (item.type === 'youtube' ? 'Play Video' : 'View Image')}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Dialog 
        open={selectedIndex !== null} 
        onOpenChange={(open) => !open && setSelectedIndex(null)}
      >
        <DialogContent className="max-w-4xl bg-black/95 border-gray-800">
          {selectedIndex !== null && items[selectedIndex] && (
            <div className="relative">
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute -top-2 -right-2 p-1 bg-white/10 rounded-full hover:bg-white/20 z-50"
              >
                <X className="w-5 h-5" />
              </button>

              {items[selectedIndex].type === 'image' ? (
                <img
                  src={items[selectedIndex].url}
                  alt={items[selectedIndex].title || ''}
                  className="w-full max-h-[80vh] object-contain"
                />
              ) : (
                <VideoEmbed
                  videoId={items[selectedIndex].url}
                  title={items[selectedIndex].title}
                />
              )}

              {items.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {items[selectedIndex].title && (
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-medium">{items[selectedIndex].title}</h3>
                  {items[selectedIndex].description && (
                    <p className="text-sm text-gray-400 mt-1">
                      {items[selectedIndex].description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}