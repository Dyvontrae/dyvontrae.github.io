import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Section, SubItem } from '@/types/portfolio';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">
            {initialData ? 'Edit' : 'Create'} {type === 'section' ? 'Section' : 'Sub Item'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            {type === 'section' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Icon</label>
                  <Input
                    value={'icon' in formData ? formData.icon : ''}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <Input
                    type="color"
                    value={'color' in formData ? formData.color : '#000000'}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Save'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}