import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { z } from 'zod';
import type { Media } from './SubItemMedia';

const MediaSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('file'),
    file: z.instanceof(File).refine(
      (file) => file.size <= 5242880, // 5MB
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
    url: z.string().url().regex(/youtu\.?be/),
    metadata: z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      thumbnail: z.string().url().optional()
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
      const videoId = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      const mediaData = {
        type: 'youtube' as const,
        url: youtubeUrl,
        metadata: {
          ...metadata,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }
      };

      MediaSchema.parse(mediaData);
      onUploadComplete(mediaData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        onError(error.errors[0].message);
      } else {
        onError(error instanceof Error ? error.message : 'Invalid YouTube URL');
      }
    }
  }, [youtubeUrl, metadata, onUploadComplete, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.webm']
    },
    maxSize: 5242880, // 5MB
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
            placeholder="YouTube URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleYoutubeSubmit}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add YouTube Video
          </button>
        </div>
      )}

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Title"
          value={metadata.title}
          onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
          className="w-full p-2 border rounded"
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
            placeholder="Alt text for accessibility"
            value={metadata.altText}
            onChange={(e) => setMetadata(prev => ({ ...prev, altText: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        )}
      </div>
    </div>
  );
};

export default MediaUpload;