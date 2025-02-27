import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MediaUpload } from '@/components/MediaUpload';
import type { Section, SubItem } from '@/types/portfolio';
import type { MediaItem } from '@/components/MediaUpload';
import { RichTextEditor } from './RichTextEditor';

// Define a type that encompasses all possible properties
type FormDataType = {
  title: string;
  description: string;
  icon?: string;
  color?: string;
  order_index?: number;
  media_items?: MediaItem[];
  section_id?: string;
  media_urls?: string[];
  media_types?: string[];
  content?: any[];
  type?: string;
  [key: string]: any; // Allow any additional properties
};

interface SectionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (section: FormDataType) => Promise<void>;
  initialData?: Section | SubItem | null;
  type: 'section' | 'subitem';
  sectionId?: string | null;
}

export default function SectionEditor({
  open,
  onOpenChange,
  onSave,
  initialData,
  type,
  sectionId
}: SectionEditorProps) {
  // Initialize form data with proper typing
  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    description: '',
    icon: '',
    color: '#000000',
    order_index: 0,
    media_urls: [],
    media_types: [],
    media_items: []
  });

  // Update formData when initialData changes
  useEffect(() => {
    if (initialData) {
      // Create a clean object with all needed properties
      const newFormData: FormDataType = {
        title: initialData.title || '',
        description: initialData.description || '',
        order_index: 'order_index' in initialData ? initialData.order_index : 0
      };

      // Add section-specific properties
      if ('icon' in initialData) {
        newFormData.icon = initialData.icon;
      }
      if ('color' in initialData) {
        newFormData.color = initialData.color;
      }

      // Add subitem-specific properties
      if ('section_id' in initialData) {
        newFormData.section_id = initialData.section_id;
      }
      if ('media_items' in initialData) {
        newFormData.media_items = initialData.media_items || [];
      }
      if ('media_urls' in initialData) {
        newFormData.media_urls = initialData.media_urls;
      }
      if ('media_types' in initialData) {
        newFormData.media_types = initialData.media_types;
      }

      setFormData(newFormData);
    } else {
      // Reset to defaults when there's no initialData
      setFormData({
        title: '',
        description: '',
        icon: '',
        color: '#000000',
        order_index: 0,
        media_urls: [],
        media_types: [],
        media_items: []
      });
    }
  }, [initialData]);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploading(true);
    
    try {
      if (!formData.title || !formData.title.trim()) {
        throw new Error('Title is required');
      }
      
      if (!formData.description || !formData.description.trim()) {
        throw new Error('Description is required');
      }

      await onSave(formData);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
      console.error('Error saving:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit' : 'Create'} {type === 'section' ? 'Section' : 'Sub Item'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData({...formData, description: value})}
              placeholder="Enter description... (Markdown supported)"
              error={error || undefined}
            />
          </div>

          {type === 'section' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Icon</label>
                <Input
                  value={formData.icon || ''}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter emoji or icon..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    value={formData.color || '#000000'}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="h-10 p-1 bg-gray-800 border-gray-700 w-20"
                  />
                  <span className="text-sm text-gray-400">
                    Select accent color for the section
                  </span>
                </div>
              </div>
            </>
          )}

          {type === 'subitem' && (
            <div>
              <label className="block text-sm font-medium mb-1">Media</label>
              <MediaUpload
                mediaItems={formData.media_items || []}
                onMediaChange={(items) => setFormData({...formData, media_items: items})}
                maxFiles={10}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-md p-3">
              <p className="text-sm text-white">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={uploading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {uploading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}