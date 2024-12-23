import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PortfolioSection } from '@/components/PortfolioSection';
import ContactManager from '@/components/ContactManager';
import type { Section, SubItem } from '@/types/portfolio';
import { Header } from '@/components/layout/Header';
import { MediaUpload } from '@/components/MediaUpload';
import type { MediaItem } from '@/components/MediaUpload';

type ErrorWithMessage = {
  message: string;
};

interface FormState {
  title: string;
  description: string;
  icon?: string;
  color?: string;
  order_index?: number;
  media_items?: MediaItem[];
  section_id?: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message;
}

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
  const [activeTab, setActiveTab] = useState<'content' | 'contact'>('content');
  
  // Form state
  const [formData, setFormData] = useState<FormState>({
    title: '',
    description: '',
    icon: '',
    color: '#000000',
    media_items: []
  });

  // Helper function to check if currentItem is a Section
  const isSection = (item: Section | SubItem | null): item is Section => {
    return item !== null && 'icon' in item && 'color' in item;
  };

  // Helper function to check if currentItem is a SubItem
  const isSubItem = (item: Section | SubItem | null): item is SubItem => {
    return item !== null && 'section_id' in item && 'media_urls' in item;
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: '',
      color: '#000000',
      media_items: []
    });
  };

  // Initialize form data when currentItem changes
  useEffect(() => {
    if (currentItem) {
      if (isSection(currentItem)) {
        setFormData({
          title: currentItem.title,
          description: currentItem.description,
          icon: currentItem.icon,
          color: currentItem.color,
          order_index: currentItem.order_index
        });
      } else if (isSubItem(currentItem)) {
        setFormData({
          title: currentItem.title,
          description: currentItem.description,
          media_items: currentItem.media_items || [],
          order_index: currentItem.order_index,
          section_id: currentItem.section_id
        });
      }
    } else {
      resetForm();
    }
  }, [currentItem]);

  const handleError = (err: unknown) => {
    setError(getErrorMessage(err));
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
  
      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .order('order_index');
  
      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);
  
      // Fetch subitems with explicit selection of media_items
      const subItemsMap: Record<string, SubItem[]> = {};
      for (const section of sectionsData || []) {
        const { data: subItemsData, error: subItemsError } = await supabase
          .from('sub_items')
          .select(`
            *,
            media_items
          `)
          .eq('section_id', section.id)
          .order('order_index');
  
        console.log('Fetched SubItems for section', section.id, ':', subItemsData);
  
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
        section_id: sectionId
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
      const { data, error } = await supabase
        .from('sub_items')
        .update(updates)
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

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (editingType === 'section') {
        const sectionData = {
          title: formData.title,
          description: formData.description,
          icon: formData.icon || '',
          color: formData.color || '#000000',
          order_index: formData.order_index || sections.length
        };

        if (isSection(currentItem)) {
          await handleUpdateSection(currentItem.id, sectionData);
        } else {
          await handleCreateSection(sectionData);
        }
      } else {
        if (!currentSectionId) {
          throw new Error('No section ID provided for sub-item');
        }

        const subItemData = {
          title: formData.title,
          description: formData.description,
          order_index: formData.order_index || (subItems[currentSectionId]?.length || 0),
          media_items: formData.media_items || [],
          section_id: currentSectionId,
          content: [], // Required by SubItem interface
          type: 'gallery' as const, // Default to gallery
          media_urls: formData.media_items?.map(item => item.url) || [], // Convert media_items to urls
          media_types: formData.media_items?.map(item => item.type) || [] // Convert media_items to types
        };

        if (isSubItem(currentItem)) {
          await handleUpdateSubItem(currentItem.id, subItemData);
        } else {
          await handleCreateSubItem(currentSectionId, subItemData);
        }
      }
      
      setIsDialogOpen(false);
      setCurrentItem(null);
      setCurrentSectionId(null);
      resetForm();
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
    <>  
      <Header />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Portfolio Admin Panel</h1>
          <div className="flex gap-2">
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
        </div>

        <div className="border-b mb-6">
          <div className="flex gap-4">
            <button
              className={`py-2 px-4 -mb-px ${
                activeTab === 'content' ? 'border-b-2 border-blue-500 font-medium' : ''
              }`}
              onClick={() => setActiveTab('content')}
            >
              Content
            </button>
            <button
              className={`py-2 px-4 -mb-px ${
                activeTab === 'contact' ? 'border-b-2 border-blue-500 font-medium' : ''
              }`}
              onClick={() => setActiveTab('contact')}
            >
              Contact Management
            </button>
          </div>
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

        {activeTab === 'content' ? (
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
        ) : (
          <ContactManager />
        )}

        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setCurrentItem(null);
              setCurrentSectionId(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="bg-gray-900 text-white border-gray-800">
            <DialogHeader>
              <DialogTitle>
                {currentItem ? 'Edit' : 'Create'} {editingType === 'section' ? 'Section' : 'Sub Item'}
              </DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded bg-gray-800 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded bg-gray-800 text-white"
                    rows={3}
                    required
                  />
                </div>

                {editingType === 'subitem' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Media</label>
                    <MediaUpload
                      mediaItems={formData.media_items || []}
                      onMediaChange={(items) => setFormData(prev => ({ ...prev, media_items: items }))}
                      maxFiles={10}
                    />
                  </div>
                )}

                {editingType === 'section' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Icon</label>
                      <input
                        value={formData.icon || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full px-3 py-2 border rounded bg-gray-800 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Color</label>
                      <input
                        type="color"
                        value={formData.color || '#000000'}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-700"
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
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}