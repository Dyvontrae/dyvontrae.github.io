import React from 'react';

interface VideoEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
}

export function VideoEmbed({ videoId, title, className = '' }: VideoEmbedProps) {
  return (
    <div className={`aspect-video relative ${className}`}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title || 'YouTube video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full rounded-lg"
      />
    </div>
  );
}