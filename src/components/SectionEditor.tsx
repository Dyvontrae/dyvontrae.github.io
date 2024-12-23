import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Section, SubItem } from '@/types/portfolio';
import { RichTextEditor } from './RichTextEditor';

interface SectionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (section: any) => Promise<void>;
  initialData?: Section | SubItem | null;
  type: 'section' | 'subitem';
  sectionId?: string;
}

export default function SectionEditor({
  open,
  onOpenChange,
  onSave,
  initialData,
  type,
  sectionId
}: SectionEditorProps) {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      description: '',
      icon: '',
      color: '#000000',
      order_index: 0,
      media_urls: [],
      media_types: [],
      media_items: []
    }
  );

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploading(true);
    
    try {
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      
      if (!formData.description.trim()) {
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
                error={error || undefined}  // Convert null to undefined
                />
          </div>

          {type === 'section' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Icon</label>
                <Input
                  value={'icon' in formData ? formData.icon : ''}
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
                    value={'color' in formData ? formData.color : '#000000'}
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