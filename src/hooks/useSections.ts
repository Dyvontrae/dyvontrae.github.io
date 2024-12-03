import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Section {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  order_index: number;
}

export const useSections = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSections = async () => {
    try {
      setLoading(true);
      console.log('Fetching sections...');//Debug Handle

      const { data, error: fetchError } = await supabase
        .from('sections')
        .select('*')
        .order('order_index');

        console.log('Supabase response:', { data, error: fetchError });//Debug Handle

      if (fetchError) throw fetchError;
      setSections(data || []);
    } catch (err) {
      console.error('Error fetching sections:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const addSection = async (section: Omit<Section, 'id'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('sections')
        .insert([section])
        .select()
        .single();

      if (insertError) throw insertError;
      setSections(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding section:', err);
      throw err;
    }
  };

  const updateSection = async (id: string, updates: Partial<Section>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('sections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setSections(prev => prev.map(section => 
        section.id === id ? { ...section, ...data } : section
      ));
      return data;
    } catch (err) {
      console.error('Error updating section:', err);
      throw err;
    }
  };

  const deleteSection = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('sections')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setSections(prev => prev.filter(section => section.id !== id));
    } catch (err) {
      console.error('Error deleting section:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Debug log when sections state changes
  useEffect(() => {
    console.log('Current sections state:', sections);
  }, [sections]);


  return {
    sections,
    loading,
    error,
    addSection,
    updateSection,
    deleteSection,
    refreshSections: fetchSections
  };
};