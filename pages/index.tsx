import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { PortfolioSection } from '@/components/PortfolioSection';
import { VideoBackground } from '@/components/VideoBackground';
import { supabase } from '@/lib/supabase';
import type { Section, SubItem } from '@/types/portfolio';

export default function Home() {
  const [sections, setSections] = useState<Section[]>([]);
  const [subItems, setSubItems] = useState<Record<string, SubItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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
          .select(`
            *,
            media_items
          `)
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
    <main className="min-h-screen bg-[#001830]/80 backdrop-blur-lg p-4">
      <VideoBackground />
      
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
            />
          ))}
        </div>
      </div>
    </main>
  );
}