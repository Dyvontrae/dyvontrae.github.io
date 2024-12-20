import { PortfolioSection } from '../src/components/PortfolioSection'
import { useState } from 'react'
import { portfolioSections } from '../src/data/portfolioSections'
import { Settings } from 'lucide-react'

export default function Home() {
  const [expandedSection, setExpandedSection] = useState<boolean>(false);

  const handleToggle = () => {
    setExpandedSection(!expandedSection);
  };

  const handleSubItemClick = (type: string, title: string, content: any) => {
    console.log(type, title, content);
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
              isExpanded={expandedSection}
              onToggle={handleToggle}
              onSubItemClick={handleSubItemClick}
            />
          ))}
        </div>
      </div>
    </main>
  );
}