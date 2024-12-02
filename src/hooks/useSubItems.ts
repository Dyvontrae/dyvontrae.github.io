import { useState, useEffect } from 'react';
import { SubItem } from '../types';
import { subItemApi } from '../api/supabase';

export const useSubItems = (sectionId: string) => {
  const [subItems, setSubItems] = useState<SubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubItems = async () => {
    try {
      const data = await subItemApi.getAllForSection(sectionId);
      setSubItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sub-items'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sectionId) {
      fetchSubItems();
    }
  }, [sectionId]);

  const addSubItem = async (subItem: Omit<SubItem, 'id'>) => {
    try {
      const newSubItem = await subItemApi.create(subItem);
      setSubItems([...subItems, newSubItem]);
      return newSubItem;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create sub-item');
    }
  };

  const updateSubItem = async (id: string, updates: Partial<SubItem>) => {
    try {
      const updatedSubItem = await subItemApi.update(id, updates);
      setSubItems(subItems.map(item => item.id === id ? updatedSubItem : item));
      return updatedSubItem;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update sub-item');
    }
  };

  const deleteSubItem = async (id: string) => {
    try {
      await subItemApi.delete(id);
      setSubItems(subItems.filter(item => item.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete sub-item');
    }
  };

  return {
    subItems,
    loading,
    error,
    addSubItem,
    updateSubItem,
    deleteSubItem,
    refreshSubItems: fetchSubItems
  };
};