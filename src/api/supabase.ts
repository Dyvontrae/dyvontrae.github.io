// api/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Section, SubItem } from '../types';

// Single exported supabase instance
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
      .order('"order"', { ascending: true });
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
    const { data, error } = await supabase
      .from('sub_items')
      .select('*')
      .eq('section_id', sectionId)
      .order('"order"', { ascending: true });
    if (error) throw error;
    return data as SubItem[];
  },

  create: async (subItem: Omit<SubItem, 'id'>) => {
    const { data, error } = await supabase
      .from('sub_items')
      .insert(subItem)
      .select()
      .single();
    if (error) throw error;
    return data as SubItem;
  },

  update: async (id: string, updates: Partial<SubItem>) => {
    const { data, error } = await supabase
      .from('sub_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as SubItem;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('sub_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};