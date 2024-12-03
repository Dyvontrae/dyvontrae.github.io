import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import SubItemForm from './SubItemForm';

interface SubItem {
  id: string;
  title: string;
  description: string;
  section_id: string;
  media_urls: string[];
  media_types: string[];
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

  console.log('SubItemList mounted for section:', sectionId);

  useEffect(() => {
    fetchSubItems();
  }, [sectionId]);

  const fetchSubItems = async () => {
    try {
      setLoading(true);
      console.log('Fetching sub-items for section:', sectionId);

      const { data, error } = await supabase
        .from('sub_items')
        .select('*')
        .eq('section_id', sectionId)
        .order('order_index');

      console.log('Fetched sub-items:', { data, error });

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
      const subItemData = {
        section_id: sectionId,
        title: data.title,
        description: data.description,
        media_urls: data.media_urls,
        media_types: data.media_types,
        order_index: data.order // Convert 'order' to 'order_index'
      };

      if (editingItem) {
        const { error } = await supabase
          .from('sub_items')
          .update(subItemData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sub_items')
          .insert([subItemData]);

        if (error) throw error;
      }
      
      fetchSubItems();
      setEditingItem(null);
    } catch (err) {
      console.error('Error saving sub-item:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sub_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchSubItems();
    } catch (err) {
      console.error('Error deleting sub-item:', err);
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubItemList;