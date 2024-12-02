import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { useSections } from '../hooks/useSections';
import { Section } from '../types';
import { motion } from 'framer-motion';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { PasswordModal } from './PasswordModal';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const {
    sections,
    loading: sectionsLoading,
    error,
    addSection,
    updateSection,
    deleteSection
  } = useSections();

  const [editingSection, setEditingSection] = useState<Section | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            navigate('/login');
            return;
          }
          setIsAuthenticated(true);
          setUserEmail(session.user.email ?? null);  // Use nullish coalescing
        } catch (error) {
          console.error('Auth error:', error);
          navigate('/login');
        } finally {
          setAuthLoading(false);
        }
      };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const sectionData: Omit<Section, 'id'> = {
      title: formData.get('title') as string,
      icon: formData.get('icon') as string,
      color: formData.get('color') as string,
      description: formData.get('description') as string,
      order: parseInt(formData.get('order') as string)
    };

    try {
      if (editingSection?.id) {
        await updateSection(editingSection.id, sectionData);
      } else {
        await addSection(sectionData);
      }
      setEditingSection(null);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error('Failed to save section:', err);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      navigate('/login');
    }
  };

  if (authLoading || sectionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Portfolio Admin Panel</h1>
              {userEmail && <p className="text-gray-600 mt-1">Welcome, {userEmail}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 text-gray-700"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingSection ? 'Edit Section' : 'Add New Section'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingSection?.title}
                  placeholder="Enter section title"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon Name
                </label>
                <input
                  type="text"
                  name="icon"
                  defaultValue={editingSection?.icon}
                  placeholder="Enter icon name"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  name="color"
                  defaultValue={editingSection?.color || "#004494"}
                  className="w-full h-10 p-1 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  defaultValue={editingSection?.order}
                  placeholder="Enter display order"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={editingSection?.description}
                placeholder="Enter section description"
                rows={4}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              {editingSection && (
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {editingSection ? 'Update Section' : 'Add Section'}
              </button>
            </div>
          </form>
        </div>

        {sections.length > 0 && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Existing Sections</h2>
            <div className="space-y-4">
              {sections.map((section) => (
                <motion.div
                  key={section.id}
                  layout
                  className="border rounded-lg p-4"
                  style={{ borderLeftColor: section.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">{section.title}</h3>
                    <div className="space-x-2">
                      <button
                        onClick={() => setEditingSection(section)}
                        className="px-3 py-1 border rounded-md hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this section?')) {
                            deleteSection(section.id!);
                          }
                        }}
                        className="px-3 py-1 border border-red-200 text-red-600 rounded-md hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2">{section.description}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    Order: {section.order} | Icon: {section.icon}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <PasswordModal 
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default AdminPanel;