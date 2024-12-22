import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Dialog } from '@/components/ui/dialog';
import { PortfolioSection } from '@/components/PortfolioSection';
import { PostgrestError } from '@supabase/supabase-js';
import type { Section, SubItem } from '@/types/portfolio';

export default function AdminPanel() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [subItems, setSubItems] = useState<Record<string, SubItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Section | SubItem | null>(null);
  const [editingType, setEditingType] = useState<'section' | 'subitem'>('section');
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

  // Helper function to check if currentItem is a Section
  const isSection = (item: Section | SubItem | null): item is Section => {
    return item !== null && 'icon' in item && 'color' in item;
  };

  // Helper function to check if currentItem is a SubItem
  const isSubItem = (item: Section | SubItem | null): item is SubItem => {
    return item !== null && 'section_id' in item && 'media_urls' in item;
  };

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    } else if (typeof err === 'string') {
      setError(err);
    } else if ((err as PostgrestError)?.message) {
      setError((err as PostgrestError).message);
    } else {
      setError('An unknown error occurred');
    }
  };

  async function checkAuth() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session) {
        router.push('/login');
        return false;
      }
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  }

  async function fetchSectionsAndSubItems() {
    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) return;

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .order('order_index');

      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);

      const subItemsMap: Record<string, SubItem[]> = {};
      for (const section of sectionsData || []) {
        const { data: subItemsData, error: subItemsError } = await supabase
          .from('sub_items')
          .select('*')
          .eq('section_id', section.id)
          .order('order_index');

        if (subItemsError) throw subItemsError;
        subItemsMap[section.id] = subItemsData || [];
      }
      setSubItems(subItemsMap);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSection(newSection: Omit<Section, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('sections')
        .insert([newSection])
        .select()
        .single();

      if (error) throw error;
      setSections([...sections, data]);
      setSubItems({ ...subItems, [data.id]: [] });
      return data;
    } catch (err) {
      handleError(err);
      return null;
    }
  }

  async function handleUpdateSection(id: string, updates: Partial<Section>) {
    try {
      const { data, error } = await supabase
        .from('sections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setSections(sections.map(section => section.id === id ? data : section));
      return data;
    } catch (err) {
      handleError(err);
      return null;
    }
  }

  async function handleCreateSubItem(sectionId: string, newSubItem: Omit<SubItem, 'id'>) {
    try {
      const subItemData = {
        ...newSubItem,
        section_id: sectionId,
        media_items: [] as { url: string; type: string; title?: string; description?: string; }[]
      };

      const { data, error } = await supabase
        .from('sub_items')
        .insert([subItemData])
        .select()
        .single();

      if (error) throw error;
      setSubItems({
        ...subItems,
        [sectionId]: [...(subItems[sectionId] || []), data]
      });
      return data;
    } catch (err) {
      handleError(err);
      return null;
    }
  }

  async function handleUpdateSubItem(id: string, updates: Partial<SubItem>) {
    try {
      const subItemUpdates = {
        ...updates,
        media_items: updates.media_items || []
      };

      const { data, error } = await supabase
        .from('sub_items')
        .update(subItemUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const sectionId = data.section_id;
      setSubItems({
        ...subItems,
        [sectionId]: subItems[sectionId].map(item => item.id === id ? data : item)
      });
      return data;
    } catch (err) {
      handleError(err);
      return null;
    }
  }

  async function handleDeleteSection(id: string) {
    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSections(sections.filter(section => section.id !== id));
      const newSubItems = { ...subItems };
      delete newSubItems[id];
      setSubItems(newSubItems);
    } catch (err) {
      handleError(err);
    }
  }

  async function handleDeleteSubItem(sectionId: string, id: string) {
    try {
      const { error } = await supabase
        .from('sub_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSubItems({
        ...subItems,
        [sectionId]: subItems[sectionId].filter(item => item.id !== id)
      });
    } catch (err) {
      handleError(err);
    }
  }

  async function handleSave(formData: any) {
    try {
      if (editingType === 'section') {
        const sectionData = {
          ...formData,
          order_index: parseInt(formData.order_index) || sections.length
        };

        if (isSection(currentItem)) {
          await handleUpdateSection(currentItem.id, sectionData);
        } else {
          await handleCreateSection(sectionData);
        }
      } else {
        const subItemData = {
          ...formData,
          order_index: parseInt(formData.order_index) || (subItems[currentSectionId || '']?.length || 0),
          media_urls: [],
          media_types: [],
          media_items: []
        };

        if (isSubItem(currentItem)) {
          await handleUpdateSubItem(currentItem.id, subItemData);
        } else if (currentSectionId) {
          await handleCreateSubItem(currentSectionId, subItemData);
        }
      }
      setIsDialogOpen(false);
      setCurrentItem(null);
      setCurrentSectionId(null);
      await fetchSectionsAndSubItems();
    } catch (err) {
      handleError(err);
    }
  }

  useEffect(() => {
    checkAuth();
    fetchSectionsAndSubItems();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Portfolio Admin Panel</h1>
        <button 
          onClick={() => {
            setEditingType('section');
            setCurrentItem(null);
            setIsDialogOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add New Section
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="float-right text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section) => (
          <PortfolioSection
            key={section.id}
            section={section}
            subItems={subItems[section.id] || []}
            isExpanded={expandedSection === section.id}
            onToggle={() => setExpandedSection(
              expandedSection === section.id ? null : section.id
            )}
            onEditSection={(section) => {
              setEditingType('section');
              setCurrentItem(section);
              setIsDialogOpen(true);
            }}
            onEditSubItem={(subItem) => {
              setEditingType('subitem');
              setCurrentItem(subItem);
              setCurrentSectionId(section.id);
              setIsDialogOpen(true);
            }}
            onAddSubItem={() => {
              setEditingType('subitem');
              setCurrentItem(null);
              setCurrentSectionId(section.id);
              setIsDialogOpen(true);
            }}
          />
        ))}
      </div>

      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setCurrentItem(null);
            setCurrentSectionId(null);
          }
        }}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {currentItem ? 'Edit' : 'Create'} {editingType === 'section' ? 'Section' : 'Sub Item'}
          </h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            handleSave(data);
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  name="title"
                  defaultValue={currentItem?.title || ''}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={currentItem?.description || ''}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  required
                />
              </div>

              {editingType === 'section' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Icon</label>
                    <input
                      name="icon"
                      defaultValue={isSection(currentItem) ? currentItem.icon : ''}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <input
                      type="color"
                      name="color"
                      defaultValue={isSection(currentItem) ? currentItem.color : '#000000'}
                      className="w-full"
                    />
                  </div>

                  <input
                    type="hidden"
                    name="order_index"
                    value={currentItem?.order_index || sections.length}
                  />
                </>
              )}

              {editingType === 'subitem' && (
                <input
                  type="hidden"
                  name="order_index"
                  value={currentItem?.order_index || (subItems[currentSectionId || '']?.length || 0)}
                />
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}