import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import SubItemForm from './SubItemForm';
import SubItemMedia from '@/components/media/SubItemMedia';

interface Media {
  type: 'file' | 'youtube';
  url?: string;
  file?: File;
  metadata: {
    title: string;
    description?: string;
    thumbnail?: string;
    altText?: string;
  };
}

interface SubItem {
  id: string;
  title: string;
  description: string;
  section_id: string;
  media_urls: string[];
  media_types: string[];
  media_items?: Media[];
  order_index: number;
}

interface SubItemFormData {
  section_id: string;
  title: string;
  description: string;
  media_urls: string[];
  media_types: string[];
  order: number;
}

interface SubItemListProps {
  sectionId: string;
}

const SubItemList = ({ sectionId }: SubItemListProps) => {
  const [subItems, setSubItems] = useState<SubItem[]>([]);
  const [editingItem, setEditingItem] = useState<SubItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchSubItems();
  }, [sectionId]);

  const fetchSubItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sub_items')
        .select('*')
        .eq('section_id', sectionId)
        .order('order_index');

      if (error) throw error;
      setSubItems(data || []);
    } catch (err) {
      console.error('Error fetching sub-items:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: SubItemFormData) => {
    try {
      const existingItem = editingItem ? subItems.find(i => i.id === editingItem.id) : null;

      const subItemData: SubItem = {
        id: editingItem?.id || '',
        section_id: sectionId,
        title: data.title,
        description: data.description,
        media_urls: existingItem?.media_urls || [],
        media_types: existingItem?.media_types || [],
        order_index: data.order,
        media_items: existingItem?.media_items || []
      };

      if (editingItem) {
        const updatedSubItems = subItems.map(item => 
          item.id === editingItem.id ? subItemData : item
        );
        setSubItems(updatedSubItems);

        const { error } = await supabase
          .from('sub_items')
          .update(subItemData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error, data: newData } = await supabase
          .from('sub_items')
          .insert([subItemData])
          .select()
          .single();

        if (error) throw error;
        if (newData) {
          setSubItems(prev => [...prev, newData as SubItem]);
        }
      }
      
      setEditingItem(null);
    } catch (err) {
      console.error('Error saving sub-item:', err);
      await fetchSubItems();
    }
  };

  const handleMediaAdd = async (itemId: string, newMedia: Media) => {
    try {
      const item = subItems.find(i => i.id === itemId);
      if (!item) return;

      let finalMedia = { ...newMedia };

      if (newMedia.file) {
        const fileExt = newMedia.file.name.split('.').pop();
        const fileName = `${itemId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('portfolio_media')
          .upload(fileName, newMedia.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio_media')
          .getPublicUrl(fileName);

        finalMedia = {
          ...newMedia,
          url: publicUrl,
        };
      }

      if (!finalMedia.url) {
        throw new Error('No URL available for media');
      }

      const updatedSubItems: SubItem[] = subItems.map(subItem => {
        if (subItem.id === itemId) {
          const updatedMediaItems = [...(subItem.media_items || []), finalMedia];
          return {
            ...subItem,
            media_items: updatedMediaItems,
            media_urls: [...subItem.media_urls, finalMedia.url!],
            media_types: [...subItem.media_types, finalMedia.type]
          };
        }
        return subItem;
      });

      setSubItems(updatedSubItems);

      const updatedItem = updatedSubItems.find(i => i.id === itemId);
      if (!updatedItem) throw new Error('Failed to update item');

      const { error } = await supabase
        .from('sub_items')
        .update({
          media_items: updatedItem.media_items,
          media_urls: updatedItem.media_urls,
          media_types: updatedItem.media_types
        })
        .eq('id', itemId);

      if (error) throw error;
    } catch (err) {
      console.error('Error in handleMediaAdd:', err);
      await fetchSubItems();
    }
  };

  const handleMediaRemove = async (itemId: string, mediaIndex: number) => {
    try {
      const item = subItems.find(i => i.id === itemId);
      if (!item) return;

      const mediaToRemove = item.media_items?.[mediaIndex];
      if (mediaToRemove?.type === 'file' && mediaToRemove.url) {
        const filePath = mediaToRemove.url.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('portfolio_media')
            .remove([filePath]);
        }
      }

      const updatedSubItems: SubItem[] = subItems.map(subItem => {
        if (subItem.id === itemId) {
          return {
            ...subItem,
            media_items: (subItem.media_items || []).filter((_, i) => i !== mediaIndex),
            media_urls: subItem.media_urls.filter((_, i) => i !== mediaIndex),
            media_types: subItem.media_types.filter((_, i) => i !== mediaIndex)
          };
        }
        return subItem;
      });

      setSubItems(updatedSubItems);

      const updatedItem = updatedSubItems.find(i => i.id === itemId);
      if (!updatedItem) throw new Error('Failed to update item');

      const { error } = await supabase
        .from('sub_items')
        .update({
          media_items: updatedItem.media_items,
          media_urls: updatedItem.media_urls,
          media_types: updatedItem.media_types
        })
        .eq('id', itemId);

      if (error) throw error;
    } catch (err) {
      console.error('Error removing media:', err);
      await fetchSubItems();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const itemToDelete = subItems.find(item => item.id === id);
      if (itemToDelete?.media_items) {
        for (const media of itemToDelete.media_items) {
          if (media.type === 'file' && media.url) {
            const filePath = media.url.split('/').pop();
            if (filePath) {
              await supabase.storage
                .from('portfolio_media')
                .remove([filePath]);
            }
          }
        }
      }

      setSubItems(subItems.filter(item => item.id !== id));

      const { error } = await supabase
        .from('sub_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting sub-item:', err);
      await fetchSubItems();
    }
  };

  if (loading) return <div>Loading sub-items...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <SubItemForm
        sectionId={sectionId}
        onSubmit={handleSubmit}
        editingItem={editingItem}
        onCancel={() => setEditingItem(null)}
      />

      {subItems.length === 0 ? (
        <p className="text-gray-500 italic">No items yet</p>
      ) : (
        <div className="space-y-4">
          {subItems.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <SubItemMedia
                  mediaItems={item.media_items || []}
                  onMediaAdd={(media) => handleMediaAdd(item.id, media)}
                  onMediaRemove={(index) => handleMediaRemove(item.id, index)}
                  isEditing={editingItem?.id === item.id}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubItemList;