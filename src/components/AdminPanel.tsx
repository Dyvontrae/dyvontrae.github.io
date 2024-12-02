// components/AdminPanel.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { useSections } from '../hooks/useSections';
import { Section } from '../types';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { SectionForm } from './sections/SectionForm';
import { SubItemForm } from './subitems/SubItemForm';
import { PasswordModal } from './PasswordModal';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const {
    sections,
    loading: sectionsLoading,
    error,
    addSection,
    updateSection,
    deleteSection
  } = useSections();

  // Auth effect remains the same...
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }
        setIsAuthenticated(true);
        setUserEmail(session.user.email ?? null);
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

  const handleSectionSubmit = async (sectionData: Omit<Section, 'id'>) => {
    try {
      if (editingSection?.id) {
        await updateSection(editingSection.id, sectionData);
      } else {
        await addSection(sectionData);
      }
      setEditingSection(null);
    } catch (err) {
      console.error('Failed to save section:', err);
    }
  };

  const handleSubItemSubmit = async (data: {
    section_id: string;
    title: string;
    description: string;
    media_urls: string[];
    media_types: string[];
    order: number;
  }) => {
    console.log('SubItem submitted:', data);
    setSelectedSectionId(null);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
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

  if (!isAuthenticated) return null;

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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Portfolio Admin Panel</h1>
              {userEmail && <p className="text-gray-600 mt-1">Welcome, {userEmail}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
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

        {/* Section Form */}
        <SectionForm 
          editingSection={editingSection}
          onSubmit={handleSectionSubmit}
          onCancel={() => setEditingSection(null)}
        />

        {/* Sub Item Form */}
        {selectedSectionId && (
          <SubItemForm 
            sectionId={selectedSectionId}
            onSubmit={handleSubItemSubmit}
            onCancel={() => setSelectedSectionId(null)}
          />
        )}

        {/* Existing Content List */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="border rounded-lg p-4"
              style={{ borderLeftColor: section.color, borderLeftWidth: '4px' }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{section.title}</h3>
                <div className="space-x-2">
                  <button
                    onClick={() => setSelectedSectionId(section.id ?? null)}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                  >
                    Add Item
                  </button>
                  <button
                    onClick={() => setEditingSection(section)}
                    className="px-3 py-1 bg-blue-100 rounded-md hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this section?')) {
                        deleteSection(section.id!);
                      }
                    }}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mt-2">{section.description}</p>
              <div className="text-sm text-gray-500 mt-2">
                Order: {section.order} | Icon: {section.icon}
              </div>
            </div>
          ))}
        </div>

        <PasswordModal 
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default AdminPanel;