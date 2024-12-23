import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PortfolioSection } from '@/components/PortfolioSection';
import { supabase } from '@/lib/supabase';
import type { Section, SubItem } from '@/types/portfolio';

interface ModalState {
  isOpen: boolean;
  type: string | null;
  title: string;
  content: any;
}

export default function Home() {
  const [sections, setSections] = useState<Section[]>([]);
  const [subItems, setSubItems] = useState<Record<string, SubItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedModal, setSelectedModal] = useState<ModalState>({
    isOpen: false,
    type: null,
    title: '',
    content: null
  });

  async function fetchSectionsAndSubItems() {
    try {
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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSectionsAndSubItems();
  }, []);

  const handleToggle = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handleSubItemClick = (subItem: SubItem) => {
    setSelectedModal({
      isOpen: true,
      type: subItem.type,
      title: subItem.title,
      content: subItem.content
    });
  };

  const closeModal = () => {
    setSelectedModal({
      isOpen: false,
      type: null,
      title: '',
      content: null
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001830] flex items-center justify-center">
        <div className="bg-white/10 text-white px-6 py-3 rounded-lg">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#001830] p-4">
      {/* Admin Navigation */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors"
          onClick={() => window.location.href = '/login'}
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="container mx-auto max-w-3xl">
        <header className="text-center py-12">
          <h1 className="text-6xl font-bold mb-4 text-white" style={{
            textShadow: `
              2px 2px 0 #ff0000,
              -2px -2px 0 #00ff00,
              0 0 10px rgba(255,255,255,0.5)
            `,
            letterSpacing: '0.1em'
          }}>
            DYVONTRAE
          </h1>
          <div className="text-lg tracking-widest text-gray-300">
            CREATOR • ORGANIZER • DEVELOPER
          </div>
        </header>

        <div className="space-y-3">
          {sections.map((section) => (
            <PortfolioSection 
              key={section.id}
              section={section}
              subItems={subItems[section.id] || []}
              isExpanded={expandedSection === section.id}
              onToggle={() => handleToggle(section.id)}
              onEditSection={() => {}}
              onEditSubItem={handleSubItemClick}
              onAddSubItem={() => {}}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      <Dialog open={selectedModal.isOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="bg-[#001830] text-white border-blue-400">
          {selectedModal.isOpen && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{selectedModal.title}</h2>
              {/* Render content based on type */}
              {selectedModal.type === 'gallery' && (
                <div className="grid grid-cols-2 gap-4">
                  {Array.isArray(selectedModal.content) && selectedModal.content.map((item, idx) => (
                    <div key={idx} className="bg-white/10 rounded-lg p-4">
                      <img src={item.image} alt={item.title} className="w-full rounded-lg mb-2" />
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-300">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {selectedModal.type === 'youtube' && (
                <div className="grid grid-cols-2 gap-4">
                  {Array.isArray(selectedModal.content) && selectedModal.content.map((video, idx) => (
                    <div key={idx} className="bg-white/10 rounded-lg overflow-hidden">
                      <div className="relative">
                        <img 
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full rounded-t-lg"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold mb-2">{video.title}</h3>
                          <p className="text-sm text-gray-300">{video.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}