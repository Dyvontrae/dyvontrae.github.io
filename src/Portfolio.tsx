import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, Camera, Code, PenTool, ChevronDown, X, LucideIcon } from 'lucide-react';
import { supabase } from './lib/supabase';
import VideoBackground from './components/media/VideoBackground';
import Footer from './components/Footer';

// Types
interface SubItem {
  id: number;
  title: string;
  description: string;
  media_urls: string[];
  media_types: string[];
}

interface Section {
  id: number;
  title: string;
  icon: string;
  color: string;
  description: string;
  sub_items: SubItem[];
  order_index?: number;
}

interface VideoEmbedProps {
  url: string;
}

// Constants
const colors = {
  pumpkin: '#FF6700',
  antiFlashWhite: '#EBEBEB',
  silver: '#C0C0C0',
  biceBlue: '#3A6EA5',
  polynesianBlue: '#004E98'
} as const;

// Default sections for fallback
const defaultSections: Section[] = [
  {
    id: 1,
    title: 'Community Action',
    icon: 'Heart',
    color: colors.polynesianBlue,
    description: 'Housing Justice & Community Building',
    sub_items: [
      {
        id: 1,
        title: 'Housing Rights Workshop',
        description: 'Community education series on tenant rights',
        media_urls: ['/api/placeholder/800/600'],
        media_types: ['image']
      }
    ]
  },
  {
    id: 2,
    title: 'Events',
    icon: 'Users',
    color: colors.pumpkin,
    description: 'Texas Toku Taisen & Cultural Events',
    sub_items: [
      {
        id: 2,
        title: 'Anime at the Alamo',
        description: 'Free community anime screenings at the Alamo Drafthouse',
        media_urls: ['/api/placeholder/800/600'],
        media_types: ['image']
      }
    ]
  },
  {
    id: 3,
    title: 'Media',
    icon: 'Camera',
    color: colors.biceBlue,
    description: 'Video Production & Content Creation',
    sub_items: [
      {
        id: 3,
        title: 'YouTube Channel',
        description: 'Regular content updates and tutorials',
        media_urls: ['/api/placeholder/800/600'],
        media_types: ['image']
      }
    ]
  },
  {
    id: 4,
    title: 'Art & Illustration',
    icon: 'PenTool',
    color: colors.pumpkin,
    description: 'Digital Art & Traditional Illustrations',
    sub_items: [
      {
        id: 4,
        title: 'Digital Art Portfolio',
        description: 'Collection of digital illustrations and designs',
        media_urls: ['/api/placeholder/800/600'],
        media_types: ['image']
      }
    ]
  },
  {
    id: 5,
    title: 'Development',
    icon: 'Code',
    color: colors.polynesianBlue,
    description: 'Software & Web Solutions',
    sub_items: [
      {
        id: 5,
        title: 'Portfolio Projects',
        description: 'Collection of web and software development work',
        media_urls: ['/api/placeholder/800/600'],
        media_types: ['image']
      }
    ]
  }
];

// Video embedding component
const VideoEmbed: React.FC<VideoEmbedProps> = ({ url }) => {
  const getEmbedUrl = (videoUrl: string): string => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.split('v=')[1] || videoUrl.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (videoUrl.includes('instagram.com')) {
      const postId = videoUrl.split('/p/')[1]?.split('/')[0];
      return `https://www.instagram.com/p/${postId}/embed`;
    }
    if (videoUrl.includes('tiktok.com')) {
      const videoId = videoUrl.split('/video/')[1]?.split('?')[0];
      return `https://www.tiktok.com/embed/${videoId}`;
    }
    return videoUrl;
  };

  return (
    <div className="aspect-w-16 aspect-h-9">
      <iframe
        src={getEmbedUrl(url)}
        className="w-full h-full"
        allowFullScreen
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture"
      />
    </div>
  );
};

// Main Portfolio component
const Portfolio: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [lightboxContent, setLightboxContent] = useState<SubItem | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    console.log('Current sections:', sections);
  }, [sections]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch sections');

      const { data, error } = await supabase
        .from('sections')
        .select(`
          *,
          sub_items (*)
        `)
        .order('order_index');

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        setSections(defaultSections);
      } else if (!data || data.length === 0) {
        console.log('No data returned from Supabase, using default sections');
        setSections(defaultSections);
      } else {
        console.log('Setting sections from database:', data);
        setSections(data as Section[]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setSections(defaultSections);
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
      style={{ backgroundColor: `${colors.polynesianBlue}99` }} // 99 is hex for 60% opacity
    >
      <VideoBackground />

      <div className="fixed top-4 right-4 z-50">
        <a
          href="/admin"
          className="px-4 py-2 bg-gray-800 text-white rounded-lg opacity-50 hover:opacity-100 transition-opacity"
        >
          Admin
        </a>
      </div>

      <div className="flex-grow flex flex-col items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
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
          ) : (
            sections.map((section, index) => (
              <div key={section.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                  className="rounded-lg p-6 cursor-pointer transition-all w-full shadow-sm bg-opacity-80"
                  style={{ 
                    backgroundColor: `${colors.antiFlashWhite}CC`, // CC is hex for 80% opacity
                    borderLeft: `4px solid ${section.color || colors.polynesianBlue}`
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div style={{ color: section.color || colors.polynesianBlue }}>
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
                      style={{ color: section.color || colors.polynesianBlue }}
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
                <div className="grid grid-cols-2 gap-4">
                  {lightboxContent.media_urls?.map((url, idx) => (
                    lightboxContent.media_types?.[idx] === 'video' ? (
                      <VideoEmbed key={idx} url={url} />
                    ) : (
                      <img 
                        key={idx} 
                        src={url} 
                        alt={`${lightboxContent.title} ${idx + 1}`} 
                        className="rounded-lg w-full"
                      />
                    )
                  ))}
                </div>
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