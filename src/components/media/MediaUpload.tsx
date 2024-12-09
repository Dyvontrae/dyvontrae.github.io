export interface Media {
  type: 'file' | 'youtube';
  url?: string;
  videoId?: string;
  file?: File;
  metadata: {
    title: string;
    description?: string;
    thumbnail?: string;
    altText?: string;
  };
}

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { z } from 'zod';


const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Handle existing embed URLs first
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
    if (match && match[1]) {
      console.log('Found video ID:', match[1]);
      return match[1];
    }
  }
  return null;
};

const getEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}`;
};

const getThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

const MediaSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('file'),
    file: z.instanceof(File).refine(
      (file) => file.size <= 5242880,
      'File size must be 5MB or less'
    ),
    metadata: z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      altText: z.string().min(1)
    })
  }),
  z.object({
    type: z.literal('youtube'),
    url: z.string(),
    videoId: z.string(),
    metadata: z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      thumbnail: z.string().optional()
    })
  })
]);

interface MediaUploadProps {
  onUploadComplete: (media: Media) => void;
  onError: (error: string) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onUploadComplete, onError }) => {
  const [uploadType, setUploadType] = useState<'file' | 'youtube'>('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [metadata, setMetadata] = useState({ title: '', description: '', altText: '' });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const mediaData = {
        type: 'file' as const,
        file,
        metadata: {
          ...metadata,
          altText: metadata.altText || metadata.title
        }
      };

      MediaSchema.parse(mediaData);
      onUploadComplete(mediaData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        onError(error.errors[0].message);
      } else {
        onError('Upload failed: Unknown error');
      }
    }
  }, [metadata, onUploadComplete, onError]);

  const handleYoutubeSubmit = useCallback(async () => {
    try {
      console.log('Processing YouTube URL:', youtubeUrl);
      
      const videoId = getYouTubeVideoId(youtubeUrl);
      console.log('Extracted video ID:', videoId);
      
      if (!videoId) {
        throw new Error('Invalid YouTube URL. Please check the URL and try again.');
      }

      // Create URLs
      const embedUrl = getEmbedUrl(videoId);
      const thumbnailUrl = getThumbnailUrl(videoId);
      
      console.log('Created URLs:', {
        embed: embedUrl,
        thumbnail: thumbnailUrl
      });

      const mediaData = {
        type: 'youtube' as const,
        url: embedUrl,
        videoId: videoId,
        metadata: {
          ...metadata,
          thumbnail: thumbnailUrl
        }
      };

      console.log('Final media data:', mediaData);

      // Validate the complete media object
      try {
        MediaSchema.parse(mediaData);
        console.log('Validation passed');
      } catch (validationError) {
        console.error('Validation failed:', validationError);
        throw validationError;
      }

      // Verify thumbnail availability
      try {
        const thumbnailResponse = await fetch(thumbnailUrl, { method: 'HEAD' });
        if (!thumbnailResponse.ok) {
          // If maxresdefault fails, update to default thumbnail
          mediaData.metadata.thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
        }
      } catch (error) {
        console.warn('Thumbnail verification failed, using default:', error);
        mediaData.metadata.thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
      }

      onUploadComplete(mediaData);
    } catch (error) {
      console.error('YouTube submission error:', error);
      if (error instanceof z.ZodError) {
        onError(error.errors[0].message);
      } else if (error instanceof Error) {
        onError(error.message);
      } else {
        onError('Failed to process YouTube URL');
      }
    }
  }, [youtubeUrl, metadata, onUploadComplete, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.webm']
    },
    maxSize: 5242880,
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setUploadType('file')}
          className={`px-4 py-2 rounded ${uploadType === 'file' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          File Upload
        </button>
        <button
          onClick={() => setUploadType('youtube')}
          className={`px-4 py-2 rounded ${uploadType === 'youtube' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          YouTube Link
        </button>
      </div>

      {uploadType === 'file' ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        >
          <input {...getInputProps()} />
          <p>{isDragActive ? 'Drop files here!' : 'Drag & drop or click to select'}</p>
          <p className="text-sm text-gray-500 mt-2">Maximum file size: 5MB</p>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="url"
            placeholder="YouTube URL (paste video or shorts URL)"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleYoutubeSubmit}
            disabled={!youtubeUrl.trim() || !metadata.title.trim()}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add YouTube Video
          </button>
        </div>
      )}

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Title *"
          value={metadata.title}
          onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={metadata.description}
          onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
          className="w-full p-2 border rounded"
        />
        {uploadType === 'file' && (
          <input
            type="text"
            placeholder="Alt text for accessibility *"
            value={metadata.altText}
            onChange={(e) => setMetadata(prev => ({ ...prev, altText: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        )}
      </div>
    </div>
  );
};

export default MediaUpload;