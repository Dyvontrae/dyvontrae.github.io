import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Plus, Edit, Trash2, ChevronDown } from 'lucide-react';
import SectionForm from './SectionForm';
import SubItemForm from './SubItemForm';

const AdminPanel = () => {
  const [session, setSession] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [editingSubItem, setEditingSubItem] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showSubItemForm, setShowSubItemForm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) {
      fetchSections();
    }
  }, [session]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sections')
        .select(`
          *,
          sub_items (*)
        `)
        .order('order_index');

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async (sectionData) => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .insert([sectionData])
        .select();

      if (error) throw error;
      fetchSections();
      setShowSectionForm(false);
    } catch (error) {
      console.error('Error creating section:', error);
    }
  };

  const handleUpdateSection = async (sectionData) => {
    try {
      const { error } = await supabase
        .from('sections')
        .update(sectionData)
        .eq('id', editingSection.id);

      if (error) throw error;
      fetchSections();
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section and all its items?')) return;
    
    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const handleCreateSubItem = async (subItemData) => {
    try {
      const { data, error } = await supabase
        .from('sub_items')
        .insert([subItemData])
        .select();

      if (error) throw error;
      fetchSections();
      setShowSubItemForm(false);
    } catch (error) {
      console.error('Error creating sub-item:', error);
    }
  };

  const handleUpdateSubItem = async (subItemData) => {
    try {
      const { error } = await supabase
        .from('sub_items')
        .update(subItemData)
        .eq('id', editingSubItem.id);

      if (error) throw error;
      fetchSections();
      setEditingSubItem(null);
    } catch (error) {
      console.error('Error updating sub-item:', error);
    }
  };

  const handleDeleteSubItem = async (subItemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await supabase
        .from('sub_items')
        .delete()
        .eq('id', subItemId);

      if (error) throw error;
      fetchSections();
    } catch (error) {
      console.error('Error deleting sub-item:', error);
    }
  };

  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Admin</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowSectionForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} /> Add Section
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Sign Out
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setExpandedSection(
                        expandedSection === section.id ? null : section.id
                      )}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <ChevronDown
                        className={`transform transition-transform ${
                          expandedSection === section.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div>
                      <h2 className="text-lg font-medium">{section.title}</h2>
                      <p className="text-sm text-gray-500">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingSection(section)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {expandedSection === section.id && (
                  <div className="border-t border-gray-200 p-4">
                    <div className="mb-4">
                      <button
                        onClick={() => {
                          setShowSubItemForm(true);
                          setEditingSection(section);
                        }}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
                      >
                        <Plus size={16} /> Add Item
                      </button>
                    </div>
                    <div className="space-y-2">
                      {section.sub_items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                        >
                          <div>
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingSubItem(item)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-md"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSubItem(item.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Section Form Modal */}
        {(showSectionForm || editingSection) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingSection ? 'Edit Section' : 'New Section'}
              </h2>
              <SectionForm
                onSubmit={editingSection ? handleUpdateSection : handleCreateSection}
                onCancel={() => {
                  setShowSectionForm(false);
                  setEditingSection(null);
                }}
                initialData={editingSection}
              />
            </div>
          </div>
        )}

        {/* Sub-item Form Modal */}
        {(showSubItemForm || editingSubItem) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingSubItem ? 'Edit Item' : 'New Item'}
              </h2>
              <SubItemForm
                onSubmit={editingSubItem ? handleUpdateSubItem : handleCreateSubItem}
                onCancel={() => {
                  setShowSubItemForm(false);
                  setEditingSubItem(null);
                }}
                initialData={editingSubItem}
                sectionId={editingSection?.id}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;