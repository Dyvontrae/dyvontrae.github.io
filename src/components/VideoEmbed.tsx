// components/VideoEmbed.tsx
import React from 'react';

interface VideoEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
}

export function VideoEmbed({ videoId, title, className = '' }: VideoEmbedProps) {
  // Function to extract video ID from various YouTube URL formats
  const extractVideoId = (url: string): string => {
    // Handle already extracted IDs
    if (url.length === 11) return url;

    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }

    // If no patterns match, return the original string (might be a direct video ID)
    return url;
  };

  const embedId = extractVideoId(videoId);
  
  console.log('Original videoId:', videoId);
  console.log('Extracted embedId:', embedId);

  return (
    <div className={`aspect-video relative ${className}`}>
      <iframe
        src={`https://www.youtube.com/embed/${embedId}`}
        title={title || 'YouTube video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full rounded-lg"
      />
    </div>
  );
}