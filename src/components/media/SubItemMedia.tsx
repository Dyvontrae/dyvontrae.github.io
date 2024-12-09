import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Maximize2 } from 'lucide-react';
import MediaUpload, { Media } from '../media/MediaUpload';



interface SubItemMediaProps {
  mediaItems: Media[];  // Use the imported Media type directly
  onMediaAdd: (media: Media) => void;
  onMediaRemove: (index: number) => void;
  isEditing?: boolean;
}

const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const embedPattern = /youtube\.com\/embed\/([A-Za-z0-9_-]+)/;
  const embedMatch = url.match(embedPattern);
  if (embedMatch) return embedMatch[1];
  
  const patterns = [
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/,
    /youtu\.be\/([A-Za-z0-9_-]+)/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

const getEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}`;
};

const SubItemMedia: React.FC<SubItemMediaProps> = ({
  mediaItems,
  onMediaAdd,
  onMediaRemove,
  isEditing = false
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<{id: string, url: string} | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const renderMediaItem = useCallback((item: Media, mode: 'grid' | 'single' = 'single') => {
    if (!item.url) return null;

    if (item.type === 'youtube') {
      const videoId = item.videoId || getYouTubeVideoId(item.url);
      
      if (!videoId) {
        return (
          <div className="w-full aspect-video flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4">
            <p className="text-red-500 mb-2">Unable to load video preview</p>
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {item.metadata.title || 'Watch Video'}
            </a>
          </div>
        );
      }

      return (
        <div className="relative w-full aspect-video">
          <div 
            onClick={() => {
              if (mode === 'grid') {
                setCurrentIndex(mediaItems.findIndex(m => m.url === item.url));
                setViewMode('single');
              } else {
                setActiveVideo({
                  id: videoId,
                  url: getEmbedUrl(videoId)
                });
              }
            }}
            className="relative w-full h-full cursor-pointer group"
          >
            {item.metadata.thumbnail ? (
              <img
                src={item.metadata.thumbnail}
                alt={item.metadata.title || 'Video thumbnail'}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                  target.onerror = () => {
                    target.src = `https://img.youtube.com/vi/${videoId}/0.jpg`;
                    target.onerror = null;
                  };
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <p className="mb-2">{item.metadata.title || 'Video Preview Unavailable'}</p>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Watch on YouTube
                  </a>
                </div>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
          {mode === 'single' && item.metadata.description && (
            <p className="mt-2 text-sm text-gray-600">
              {item.metadata.description}
            </p>
          )}
        </div>
      );
    } else {
      return (
        <div 
          className={`relative w-full ${mode === 'grid' ? 'aspect-video' : 'h-full'}`}
          onClick={() => {
            if (mode === 'grid') {
              setCurrentIndex(mediaItems.findIndex(m => m.url === item.url));
              setViewMode('single');
            }
          }}
        >
          <img
            src={item.url}
            alt={item.metadata.altText || item.metadata.title}
            className={`w-full h-full object-cover rounded-lg ${mode === 'grid' ? 'cursor-pointer' : ''}`}
          />
          {mode === 'grid' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all group">
              <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          {mode === 'single' && item.metadata.description && (
            <p className="mt-4 text-sm text-gray-600">
              {item.metadata.description}
            </p>
          )}
        </div>
      );
    }
  }, [mediaItems]);

  return (
    <div className="relative w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {mediaItems.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-auto">
            {mediaItems.map((item, index) => (
              <div key={index} className="aspect-video w-full">
                {renderMediaItem(item, 'grid')}
              </div>
            ))}
          </div>
        ) : (
          <div className="relative w-full">
            <div className="aspect-video mb-4">
              {renderMediaItem(mediaItems[currentIndex], 'single')}
            </div>
            
            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/75 transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/75 transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            
            <button
              onClick={() => setViewMode('grid')}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/75 transition-colors"
            >
              <X size={16} />
            </button>
            
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full">
              {currentIndex + 1} / {mediaItems.length}
            </div>
            
            {isEditing && (
              <button
                onClick={() => onMediaRemove(currentIndex)}
                className="absolute top-4 left-4 p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )
      ) : (
        <div className="w-full h-48 flex items-center justify-center border-2 border-dashed rounded-lg">
          <p className="text-gray-500">No media added yet</p>
        </div>
      )}

      {isEditing && (
        <div className="mt-4">
          {showUpload ? (
            <div className="border rounded-lg p-4">
              <MediaUpload
                onUploadComplete={(media: Media) => {
                  console.log('Media upload complete:', media);
                  if (media.type === 'youtube') {
                    const videoId = getYouTubeVideoId(media.url || '');
                    if (videoId) {
                      media.videoId = videoId;
                    }
                  }
                  onMediaAdd(media);
                  setShowUpload(false);
                }}
                onError={(error: unknown) => {
                  console.error('Upload error:', error);
                  if (typeof error === 'string') {
                    setError(error);
                  } else if (error instanceof Error) {
                    setError(error.message);
                  } else {
                    setError('An error occurred');
                  }
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => {
                setShowUpload(true);
                setError(null);
              }}
              className="w-full py-2 px-4 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50"
            >
              <Plus size={20} />
              Add Media
            </button>
          )}
        </div>
      )}

      {activeVideo && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto"
          onClick={() => setActiveVideo(null)}
        >
          <div className="min-h-screen px-4 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/75 transition-opacity"></div>
            
            <div 
              className="relative bg-black rounded-lg overflow-hidden max-w-6xl w-full mx-auto my-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="aspect-video">
                <iframe
                  src={activeVideo.url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubItemMedia;