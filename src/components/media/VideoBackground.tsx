import React, { useState, useEffect } from 'react';

interface YouTubeResponse {
  items: {
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
    };
  }[];
}

const VideoBackground: React.FC = () => {
  const [videoIds, setVideoIds] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCE6oSz-JTHdqYRsmXm_ByfA&maxResults=50&type=video&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
        );
        
        if (!response.ok) {
          console.error('YouTube API Error:', await response.text());
          return;
        }
        
        const data: YouTubeResponse = await response.json();
        if (!data?.items) {
          console.error('No videos found:', data);
          return;
        }
        
        const ids = data.items.map(item => item.id.videoId);
        setVideoIds(shuffleArray(ids));
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  const shuffleArray = (array: string[]): string[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleVideoEnd = (): void => {
    setCurrentVideoIndex((prev) => (prev + 1) % videoIds.length);
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="relative w-full h-full">
        {videoIds.length > 0 && (
          <iframe
            src={`https://www.youtube.com/embed/${videoIds[currentVideoIndex]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoIds.join(',')}&enablejsapi=1`}
            className="absolute w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            onEnded={handleVideoEnd}
          />
        )}
      </div>

      <div 
        className="absolute inset-0 bg-polynesianBlue/50 backdrop-blur backdrop-brightness-75"
        style={{ 
          backdropFilter: `blur(14px)`,
          opacity: 1
        }}
      />
    </div>
  );
};

export default VideoBackground;