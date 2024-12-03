import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { useSections } from '../hooks/useSections';
import { Section } from '../types';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { SectionForm } from './sections/SectionForm';
import SubItemList from './subitems/SubItemList';
import { PasswordModal } from './PasswordModal';
import { CollapsibleSection } from './CollapsibleSection';

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

  // Debug log for sections data
  useEffect(() => {
    if (!sectionsLoading) {
      console.log('Debug: Current sections:', sections);
    }
  }, [sections, sectionsLoading]);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Debug: Starting auth check');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Debug: Auth session:', session);
        
        if (!session) {
          console.log('Debug: No session, redirecting to login');
          navigate('/login');
          return;
        }
        setIsAuthenticated(true);
        setUserEmail(session.user.email ?? null);
        console.log('Debug: Authentication successful:', session.user.email);
      } catch (error) {
        console.error('Debug: Auth error:', error);
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
    console.log('Debug: Submitting section data:', sectionData);
    try {
      if (editingSection?.id) {
        console.log('Debug: Updating existing section:', editingSection.id);
        await updateSection(editingSection.id, sectionData);
      } else {
        console.log('Debug: Creating new section');
        await addSection(sectionData);
      }
      setEditingSection(null);
    } catch (err) {
      console.error('Debug: Failed to save section:', err);
    }
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
    console.log('Debug: Loading state:', { authLoading, sectionsLoading });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (error) {
    console.error('Debug: Error fetching sections:', error);
    return (
      <div className="p-6 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug info overlay - only visible during development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 right-0 bg-black/10 text-xs p-2 m-2 rounded">
          Sections: {sections.length} | Loading: {String(sectionsLoading)}
        </div>
      )}

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

        {/* Sections List with Sub-items */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-lg shadow-sm"
            >
              <div
                className="border rounded-lg p-4"
                style={{ borderLeftColor: section.color, borderLeftWidth: '4px' }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{section.title}</h3>
                  <div className="space-x-2">
                    <button
                      onClick={() => setSelectedSectionId(
                        selectedSectionId === section.id ? null : section.id ?? null
                      )}
                      className="px-3 py-1 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                    >
                      {selectedSectionId === section.id ? 'Close Items' : 'Manage Items'}
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
                  Order: {section.order_index} | Icon: {section.icon}
                </div>
              </div>
              
              {/* Sub-items Management */}
              {selectedSectionId === section.id && (
                <div className="border-t p-4">
                  <CollapsibleSection
                    title="Manage Items"
                    description={`Add and manage items for ${section.title}`}
                    defaultOpen={true}
                  >
                    <SubItemList sectionId={section.id!} />
                  </CollapsibleSection>
                </div>
              )}
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