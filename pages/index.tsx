import { PortfolioSection } from '../src/components/PortfolioSection'
import { useState } from 'react'
import { portfolioSections } from '../src/data/portfolioSections'
import { Settings } from 'lucide-react'
import { Dialog, DialogContent } from '../components/ui/dialog'

export default function Home() {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [selectedModal, setSelectedModal] = useState({
    isOpen: false,
    type: null,
    title: '',
    content: null
  });

  const handleToggle = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const handleSubItemClick = (type: string, title: string, content: any) => {
    setSelectedModal({
      isOpen: true,
      type,
      title,
      content
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
          {portfolioSections.map((section, index) => (
            <PortfolioSection 
              key={index}
              section={section}
              isExpanded={expandedSection === index}
              onToggle={() => handleToggle(index)}
              onSubItemClick={handleSubItemClick}
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