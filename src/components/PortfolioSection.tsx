import { ChevronDown } from 'lucide-react';
import type { PortfolioSection } from '../data/portfolioSections';

interface PortfolioSectionProps {
  section: PortfolioSection;
  isExpanded: boolean;
  onToggle: () => void;
  onSubItemClick: (type: string, title: string, content: any) => void;
}

export function PortfolioSection({ 
  section, 
  isExpanded, 
  onToggle, 
  onSubItemClick 
}: PortfolioSectionProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`w-full bg-white/10 backdrop-blur-sm rounded-lg p-4 
        border-l-4 ${section.color} hover:bg-white/15 transition-all
        shadow-lg text-white`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl">{section.icon}</span>
            <div>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="text-blue-200 text-sm">{section.description}</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`} />
        </div>
      </button>
      
      {isExpanded && (
        <div className="mt-1 space-y-2">
          {section.subItems.map((subItem, idx) => (
            <button
              key={idx}
              onClick={() => onSubItemClick(subItem.type, subItem.title, subItem.content)}
              className="w-full bg-white/5 rounded-lg p-3 text-left text-white hover:bg-white/10"
            >
              {subItem.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}