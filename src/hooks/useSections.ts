import { useState, useEffect } from 'react';
import { Section } from '../types';
import { sectionApi } from '../api/supabase';

export const useSections = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSections = async () => {
    try {
      const data = await sectionApi.getAll();
      setSections(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sections'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const addSection = async (section: Omit<Section, 'id'>) => {
    try {
      const newSection = await sectionApi.create(section);
      setSections([...sections, newSection]);
      return newSection;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create section');
    }
  };

  const updateSection = async (id: string, updates: Partial<Section>) => {
    try {
      const updatedSection = await sectionApi.update(id, updates);
      setSections(sections.map(s => s.id === id ? updatedSection : s));
      return updatedSection;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update section');
    }
  };

  const deleteSection = async (id: string) => {
    try {
      await sectionApi.delete(id);
      setSections(sections.filter(s => s.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete section');
    }
  };

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