import React, { useState } from 'react';
import { Upload, X, Loader2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { uploadMediaFile, deleteMediaFile } from '@/lib/storage-utils';


export type MediaType = 'image' | 'youtube' | 'file';

export type MediaItem = {
  url: string;
  type: 'image' | 'youtube';
  title?: string;
  description?: string;
  storagePath?: string; // Add this to track the file path in storage
  file?: any; // For Supabase file metadata
  metadata?: any; // For Supabase metadata
};

interface MediaUploadProps {
  mediaItems: MediaItem[];
  onMediaChange: (items: MediaItem[]) => void;
  maxFiles?: number;
}

export function MediaUpload({ 
  mediaItems, 
  onMediaChange, 
  maxFiles = 10 
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isYoutubeDialogOpen, setIsYoutubeDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    if (mediaItems.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        try {
          const result = await uploadMediaFile(file);
          setUploadProgress(((index + 1) / files.length) * 100);
          
          return {
            url: result.url,
            type: 'image' as const,
            title: file.name,
            description: '',
            storagePath: result.path
          };
        } catch (err) {
          if (err instanceof Error) {
            throw new Error(`Failed to upload ${file.name}: ${err.message}`);
          }
          throw err;
        }
      });

      const newMediaItems = await Promise.all(uploadPromises);
      onMediaChange([...mediaItems, ...newMediaItems]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading files');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleYoutubeAdd = () => {
    try {
      // Extract video ID from various YouTube URL formats
      const url = new URL(youtubeUrl);
      let videoId = '';

      if (url.hostname.includes('youtube.com')) {
        videoId = url.searchParams.get('v') || '';
      } else if (url.hostname === 'youtu.be') {
        videoId = url.pathname.slice(1);
      }

      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      const newItem: MediaItem = {
        url: videoId,
        type: 'youtube',
        title: 'YouTube Video',
        description: ''
      };

      onMediaChange([...mediaItems, newItem]);
      setYoutubeUrl('');
      setIsYoutubeDialogOpen(false);
    } catch (err) {
      setError('Please enter a valid YouTube URL');
    }
  };

  const removeItem = async (index: number) => {
    const item = mediaItems[index];
    
    try {
      if (item.type === 'image' && item.storagePath) {
        await deleteMediaFile(item.storagePath);
      }
      
      const newItems = [...mediaItems];
      newItems.splice(index, 1);
      onMediaChange(newItems);
    } catch (err) {
      setError('Failed to remove item. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        {mediaItems.map((item, index) => (
          <div key={index} className="relative group">
            {item.type === 'image' ? (
              <img 
                src={item.url} 
                alt={item.title || 'Uploaded media'} 
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-sm text-gray-400">YouTube Video</span>
              </div>
            )}
            <button
              onClick={() => removeItem(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
      </div>

      {isUploading && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      <div className="flex gap-4">
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="media-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="media-upload"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload Images
          </label>
        </div>

        <button
          onClick={() => setIsYoutubeDialogOpen(true)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          disabled={isUploading}
        >
          Add YouTube Video
        </button>
      </div>

      <Dialog open={isYoutubeDialogOpen} onOpenChange={setIsYoutubeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add YouTube Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Enter YouTube URL (e.g., https://youtube.com/watch?v=...)"
              className="w-full px-3 py-2 border rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsYoutubeDialogOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleYoutubeAdd}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Add Video
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}