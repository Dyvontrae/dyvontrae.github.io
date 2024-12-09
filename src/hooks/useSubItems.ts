import { useState, useEffect, useCallback } from 'react';
import { SubItem } from '../types';
import { subItemApi } from '../api/supabase';

export const useSubItems = (sectionId: string) => {
  const [subItems, setSubItems] = useState<SubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubItems = useCallback(async () => {
    if (!sectionId) return;
    
    try {
      console.log('Fetching sub-items for section:', sectionId);
      setLoading(true);
      const data = await subItemApi.getAllForSection(sectionId);
      console.log('Fetched sub-items:', data);
      setSubItems(data || []);
    } catch (err) {
      console.error('Error fetching sub-items:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch sub-items'));
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    fetchSubItems();
  }, [fetchSubItems]);

  const addSubItem = async (subItem: Omit<SubItem, 'id'>) => {
    try {
      console.log('Adding sub-item:', subItem);
      const newSubItem = await subItemApi.create({
        ...subItem,
        section_id: sectionId,
        media_urls: subItem.media_urls || [],
        media_types: subItem.media_types || [],
        media_items: subItem.media_items || [],
        order_index: subItems.length
      });

      console.log('Added sub-item:', newSubItem);
      setSubItems(prev => [...prev, newSubItem]);
      return newSubItem;
    } catch (err) {
      console.error('Error adding sub-item:', err);
      throw err instanceof Error ? err : new Error('Failed to create sub-item');
    }
  };

  const updateSubItem = async (id: string, updates: Partial<SubItem>) => {
    try {
      console.log('Updating sub-item:', { id, updates });
      const updatedSubItem = await subItemApi.update(id, updates);
      console.log('Updated sub-item:', updatedSubItem);
      
      setSubItems(items => items.map(item => 
        item.id === id ? updatedSubItem : item
      ));
      
      return updatedSubItem;
    } catch (err) {
      console.error('Error updating sub-item:', err);
      throw err instanceof Error ? err : new Error('Failed to update sub-item');
    }
  };

  const deleteSubItem = async (id: string) => {
    try {
      console.log('Deleting sub-item:', id);
      await subItemApi.delete(id);
      setSubItems(items => items.filter(item => item.id !== id));
      console.log('Deleted sub-item:', id);
    } catch (err) {
      console.error('Error deleting sub-item:', err);
      throw err instanceof Error ? err : new Error('Failed to delete sub-item');
    }
  };

  const reorderSubItems = async (fromIndex: number, toIndex: number) => {
    try {
      const items = [...subItems];
      const [movedItem] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, movedItem);

      // Update order_index for all affected items
      const updates = items.map((item, index) => ({
        id: item.id!,
        order_index: index
      }));

      // Update items in database
      await Promise.all(
        updates.map(({ id, order_index }) =>
          subItemApi.update(id, { order_index })
        )
      );

      setSubItems(items);
    } catch (err) {
      console.error('Error reordering sub-items:', err);
      throw err instanceof Error ? err : new Error('Failed to reorder sub-items');
    }
  };

  return {
    subItems,
    loading,
    error,
    addSubItem,
    updateSubItem,
    deleteSubItem,
    reorderSubItems,
    refreshSubItems: fetchSubItems
  };
};