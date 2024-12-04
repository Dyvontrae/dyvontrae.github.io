import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import MediaUpload from './MediaUpload';

export interface Media {
  type: 'file' | 'youtube';
  url?: string;
  file?: File;
  metadata: {
    title: string;
    description?: string;
    thumbnail?: string;
    altText?: string;
  };
}

interface SubItemMediaProps {
  mediaItems: Media[];
  onMediaAdd: (media: Media) => void;
  onMediaRemove: (index: number) => void;
  isEditing?: boolean;
}

const SubItemMedia: React.FC<SubItemMediaProps> = ({
  mediaItems,
  onMediaAdd,
  onMediaRemove,
  isEditing = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const renderMediaItem = (item: Media) => {
    if (!item.url) return null;

    if (item.type === 'youtube') {
      const videoId = item.url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
      if (!videoId) return null;

      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full aspect-video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    } else {
      return (
        <img
          src={item.url}
          alt={item.metadata.altText || item.metadata.title}
          className="w-full h-full object-contain"
        />
      );
    }
  };

  return (
    <div className="relative w-full">
      {mediaItems.length > 0 ? (
        <div className="relative w-full h-96">
          {renderMediaItem(mediaItems[currentIndex])}
          
          {mediaItems.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full">
            {currentIndex + 1} / {mediaItems.length}
          </div>
          
          {isEditing && (
            <button
              onClick={() => onMediaRemove(currentIndex)}
              className="absolute top-4 right-4 p-2 bg-red-500 rounded-full text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
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
                onUploadComplete={(media) => {
                  onMediaAdd(media);
                  setShowUpload(false);
                }}
                onError={(error) => console.error(error)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowUpload(true)}
              className="w-full py-2 px-4 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50"
            >
              <Plus size={20} />
              Add Media
            </button>
          )}
        </div>
      )}

      {mediaItems.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {mediaItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 border-2 rounded overflow-hidden
                ${currentIndex === index ? 'border-blue-500' : 'border-transparent'}`}
            >
              {item.url && (
                <img
                  src={item.type === 'youtube' && item.metadata.thumbnail ? item.metadata.thumbnail : item.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubItemMedia;