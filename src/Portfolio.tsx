import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, Camera, Code, PenTool, ChevronDown, X, LucideIcon } from 'lucide-react';
import { supabase } from './lib/supabase';
import VideoBackground from './components/media/VideoBackground';
import SubItemMedia from './components/media/SubItemMedia';
import { Media } from './components/media/MediaUpload';
import Footer from './components/Footer';

// Types
interface SubItem {
  id: string;
  title: string;
  description: string;
  media_items: Media[];
  order_index: number;
}

interface Section {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  sub_items: SubItem[];
  order_index: number;
}

// Constants
const colors = {
  pumpkin: '#FF6700',
  antiFlashWhite: '#EBEBEB',
  silver: '#C0C0C0',
  biceBlue: '#3A6EA5',
  polynesianBlue: '#004E98'
} as const;

// Main Portfolio component
const Portfolio: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [lightboxContent, setLightboxContent] = useState<SubItem | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('sections')
        .select(`
          *,
          sub_items (*)
        `)
        .order('order_index');

      if (supabaseError) throw supabaseError;
      if (!data) throw new Error('No data returned from database');

      setSections(data as Section[]);
    } catch (err) {
      console.error('Error fetching sections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string): LucideIcon => {
    const icons: Record<string, LucideIcon> = { Heart, Users, Camera, Code, PenTool };
    return icons[iconName] || Heart;
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col relative"
      style={{ backgroundColor: `${colors.polynesianBlue}99` }}
    >
      <VideoBackground />

      <header className="fixed w-full top-0 right-0 z-50 flex justify-end p-4">
        <a
          href="/admin"
          className="px-4 py-2 bg-gray-800 text-white rounded-lg opacity-50 hover:opacity-100 transition-opacity"
        >
          Admin
        </a>
      </header>

      <div className="flex-grow flex flex-col items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 mt-8"
        >
          <h1 
            className="text-8xl font-bold mb-4"
            style={{ color: colors.antiFlashWhite }}
          >
            DYVONTRAE
          </h1>
          <div 
            className="text-sm tracking-widest"
            style={{ color: colors.silver }}
          >
            CREATOR • ORGANIZER • DEVELOPER
          </div>
        </motion.div>

        <div className="w-full max-w-4xl mx-auto px-6 pb-6 space-y-4">
          {loading ? (
            <div className="text-center text-white">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 bg-white/80 p-4 rounded-lg">
              {error}
            </div>
          ) : (
            sections.map((section) => (
              <div key={section.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                  className="rounded-lg p-6 cursor-pointer transition-all w-full shadow-sm bg-opacity-80"
                  style={{ 
                    backgroundColor: `${colors.antiFlashWhite}CC`,
                    borderLeft: `4px solid ${section.color}`
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div style={{ color: section.color }}>
                      {React.createElement(getIconComponent(section.icon), {
                        size: 24
                      })}
                    </div>
                    <div className="flex-grow">
                      <h2 
                        className="text-xl font-semibold mb-1"
                        style={{ color: colors.polynesianBlue }}
                      >
                        {section.title}
                      </h2>
                      <p style={{ color: colors.biceBlue }}>
                        {section.description}
                      </p>
                    </div>
                    <ChevronDown 
                      className={`transition-transform ${activeSection === section.id ? 'rotate-180' : ''}`}
                      style={{ color: section.color }}
                    />
                  </div>
                </motion.div>

                <AnimatePresence>
                  {activeSection === section.id && section.sub_items && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-2 pl-12">
                        {section.sub_items.map((item) => (
                          <motion.div
                            key={item.id}
                            onClick={() => setLightboxContent(item)}
                            className="p-4 rounded-lg cursor-pointer transition-all"
                            style={{ backgroundColor: colors.silver }}
                            whileHover={{ 
                              backgroundColor: colors.antiFlashWhite,
                              scale: 1.02
                            }}
                          >
                            <h3 
                              className="font-medium"
                              style={{ color: colors.polynesianBlue }}
                            >
                              {item.title}
                            </h3>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {lightboxContent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxContent(null)}
          >
            <div 
              className="max-w-4xl w-full rounded-lg overflow-hidden"
              style={{ backgroundColor: colors.antiFlashWhite }}
              onClick={e => e.stopPropagation()}
            >
              <div 
                className="flex justify-between items-center p-4 border-b"
                style={{ borderColor: colors.silver }}
              >
                <h3 
                  className="text-xl font-bold"
                  style={{ color: colors.polynesianBlue }}
                >
                  {lightboxContent.title}
                </h3>
                <button 
                  onClick={() => setLightboxContent(null)} 
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X 
                    size={24}
                    style={{ color: colors.polynesianBlue }}
                  />
                </button>
              </div>
              <div className="p-6">
                <p 
                  className="mb-4"
                  style={{ color: colors.biceBlue }}
                >
                  {lightboxContent.description}
                </p>
                {lightboxContent.media_items && lightboxContent.media_items.length > 0 ? (
                  <SubItemMedia 
                    mediaItems={lightboxContent.media_items}
                    onMediaAdd={() => {}} // No-op since we're in view mode
                    onMediaRemove={() => {}} // No-op since we're in view mode
                    isEditing={false}
                  />
                ) : (
                  <p className="text-center text-gray-500 italic">
                    No media content available
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Portfolio;