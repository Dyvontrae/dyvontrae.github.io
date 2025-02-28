import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { PortfolioSection } from '@/components/PortfolioSection';
import ContactManager from '@/components/ContactManager';
import type { Section, SubItem } from '@/types/portfolio';
import { Header } from '@/components/layout/Header';
import type { MediaItem } from '@/components/MediaUpload';
import SectionEditor from '@/components/SectionEditor';


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
  
      // Fetch subitems with explicit selection of only columns that exist
      const subItemsMap: Record<string, SubItem[]> = {};
      for (const section of sectionsData || []) {
        const { data: subItemsData, error: subItemsError } = await supabase
          .from('sub_items')
          .select(`
            id,
            section_id,
            title,
            description,
            media_urls,
            media_types,
            order_index,
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
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from section creation');
      }

      const createdSection = data[0];
      setSections([...sections, createdSection]);
      setSubItems({ ...subItems, [createdSection.id]: [] });
      return createdSection;
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
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error(`Section with ID ${id} not found`);
      }

      const updatedSection = data[0];
      setSections(sections.map(section => section.id === id ? updatedSection : section));
      return updatedSection;
    } catch (err) {
      handleError(err);
      return null;
    }
  }

  async function handleCreateSubItem(sectionId: string, newSubItem: Partial<SubItem>) {
    try {
      // Only include fields that exist in the database
      const subItemData = {
        title: newSubItem.title,
        description: newSubItem.description,
        order_index: newSubItem.order_index,
        media_items: newSubItem.media_items || [],
        section_id: sectionId,
        media_urls: newSubItem.media_urls || [],
        media_types: newSubItem.media_types || []
      };

      const { data, error } = await supabase
        .from('sub_items')
        .insert([subItemData])
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from sub-item creation');
      }

      const createdSubItem = data[0];
      setSubItems({
        ...subItems,
        [sectionId]: [...(subItems[sectionId] || []), createdSubItem]
      });
      return createdSubItem;
    } catch (err) {
      handleError(err);
      return null;
    }
  }

  async function handleUpdateSubItem(id: string, updates: Partial<SubItem>) {
    try {
      // Only include fields that exist in the database
      const dbUpdates = {
        title: updates.title,
        description: updates.description,
        order_index: updates.order_index,
        media_items: updates.media_items,
        media_urls: updates.media_urls,
        media_types: updates.media_types
      };

      const { data, error } = await supabase
        .from('sub_items')
        .update(dbUpdates)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error(`Sub item with ID ${id} not found`);
      }

      const updatedSubItem = data[0];
      const sectionId = updatedSubItem.section_id;
      
      setSubItems({
        ...subItems,
        [sectionId]: subItems[sectionId].map(item => 
          item.id === id ? updatedSubItem : item
        )
      });
      
      return updatedSubItem;
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
          media_urls: formData.media_items?.map((item: MediaItem) => item.url) || [],
          media_types: formData.media_items?.map((item: MediaItem) => item.type) || []
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
        
        <SectionEditor
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setCurrentItem(null);
              setCurrentSectionId(null);
              resetForm();
            }
          }}
          onSave={async (formData) => {
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
                  media_urls: formData.media_items?.map((item: MediaItem) => item.url) || [],
                  media_types: formData.media_items?.map((item: MediaItem) => item.type) || []
                };

                if (isSubItem(currentItem)) {
                  await handleUpdateSubItem(currentItem.id, subItemData);
                } else {
                  await handleCreateSubItem(currentSectionId, subItemData);
                }
              }
              
              await fetchSectionsAndSubItems();
            } catch (err) {
              handleError(err);
              throw err; // Rethrow so SectionEditor can handle it
            }
          }}
          initialData={currentItem}
          type={editingType}
          sectionId={currentSectionId || undefined}
        />
      </div>
    </>
  );
}