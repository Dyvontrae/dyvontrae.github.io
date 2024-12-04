import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { z } from 'zod';

type MediaData = z.infer<typeof MediaSchema>;

const MediaSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('file'),
    file: z.instanceof(File).refine(
      (file) => file.size <= parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880'),
      'File size exceeds limit'
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
  onUploadComplete: (mediaData: MediaData) => void;
  onError?: (error: string) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onUploadComplete, onError }) => {
  const [uploadType, setUploadType] = useState<'file' | 'youtube'>('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [metadata, setMetadata] = useState({ title: '', description: '' });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const mediaData = {
        type: 'file' as const,
        file,
        metadata: {
          ...metadata,
          altText: metadata.description || metadata.title // Fallback for alt text
        }
      };

      // Validate the data
      MediaSchema.parse(mediaData);
      
      // If validation passes, call onUploadComplete
      onUploadComplete(mediaData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        onError?.(error.errors[0].message);
      } else {
        onError?.('Upload failed: Unknown error');
      }
    }
  }, [metadata, onUploadComplete, onError]);

  const handleYoutubeSubmit = useCallback(async () => {
    try {
      const mediaData = {
        type: 'youtube' as const,
        url: youtubeUrl,
        metadata: {
          ...metadata,
          thumbnail: `https://img.youtube.com/vi/${youtubeUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1]}/maxresdefault.jpg`
        }
      };

      // Validate the data
      MediaSchema.parse(mediaData);
      
      // If validation passes, call onUploadComplete
      onUploadComplete(mediaData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        onError?.(error.errors[0].message);
      } else {
        onError?.('Invalid YouTube URL');
      }
    }
  }, [youtubeUrl, metadata, onUploadComplete, onError]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

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
        <div {...getRootProps()} className="border-2 border-dashed rounded p-4">
          <input {...getInputProps()} />
          <p>Drag & drop or click to upload media</p>
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
            className="px-4 py-2 bg-blue-500 text-white rounded"
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
          placeholder="Description"
          value={metadata.description}
          onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
};

export default MediaUpload;