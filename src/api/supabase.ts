// api/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Section, SubItem } from '../types';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true
    }
  }
);

// Section CRUD operations
export const sectionApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) throw error;
    return data as Section[];
  },

  create: async (section: Omit<Section, 'id'>) => {
    const { data, error } = await supabase
      .from('sections')
      .insert(section)
      .select()
      .single();
    if (error) throw error;
    return data as Section;
  },

  update: async (id: string, updates: Partial<Section>) => {
    const { data, error } = await supabase
      .from('sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Section;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('sections')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// SubItem CRUD operations
export const subItemApi = {
  getAllForSection: async (sectionId: string) => {
    console.log('Fetching sub-items for section:', sectionId);
    const { data, error } = await supabase
      .from('sub_items')
      .select('*')
      .eq('section_id', sectionId)
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching sub-items:', error);
      throw error;
    }
    
    console.log('Fetched sub-items:', data);
    return data as SubItem[];
  },

  create: async (subItem: Omit<SubItem, 'id'>) => {
    console.log('Creating sub-item:', subItem);
    const itemToCreate = {
      ...subItem,
      media_urls: subItem.media_urls || [],
      media_types: subItem.media_types || [],
      media_items: subItem.media_items || [],
      order_index: subItem.order_index ?? 0
    };

    console.log('Formatted item to create:', itemToCreate);

    const { data, error } = await supabase
      .from('sub_items')
      .insert(itemToCreate)
      .select()
      .single();

    if (error) {
      console.error('Error creating sub-item:', error);
      throw error;
    }

    console.log('Created sub-item:', data);
    return data as SubItem;
  },

  update: async (id: string, updates: Partial<SubItem>) => {
    console.log('Updating sub-item:', { id, updates });
    const updatesToApply = {
      ...updates,
      ...(updates.media_urls && { media_urls: updates.media_urls }),
      ...(updates.media_types && { media_types: updates.media_types }),
      ...(updates.media_items && { media_items: updates.media_items }),
      ...(updates.order_index !== undefined && { order_index: updates.order_index })
    };

    console.log('Formatted updates to apply:', updatesToApply);

    const { data, error } = await supabase
      .from('sub_items')
      .update(updatesToApply)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating sub-item:', error);
      throw error;
    }

    console.log('Updated sub-item:', data);
    return data as SubItem;
  },

  delete: async (id: string) => {
    console.log('Deleting sub-item:', id);
    const { error } = await supabase
      .from('sub_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting sub-item:', error);
      throw error;
    }
    console.log('Successfully deleted sub-item:', id);
  }
};