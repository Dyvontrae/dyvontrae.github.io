// src/components/PortfolioSection.tsx
import { ChevronDown } from 'lucide-react';
import { Section, SubItem } from '../types/portfolio';

interface PortfolioSectionProps {
  section: Section;
  subItems: SubItem[];
  isExpanded: boolean;
  onToggle: () => void;
  onEditSection: (section: Section) => void;
  onEditSubItem: (subItem: SubItem) => void;
  onAddSubItem: () => void;
}

export function PortfolioSection({ 
  section,
  subItems, 
  isExpanded, 
  onToggle,
  onEditSection,
  onEditSubItem,
  onAddSubItem
}: PortfolioSectionProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`w-full bg-white/10 backdrop-blur-sm rounded-lg p-4 
        border-l-4 border-[${section.color}] hover:bg-white/15 transition-all
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
          {subItems.map((subItem) => (
            <button
              key={subItem.id}
              onClick={() => onEditSubItem(subItem)}
              className="w-full bg-white/5 rounded-lg p-3 text-left text-white hover:bg-white/10"
            >
              <div className="flex justify-between items-center">
                <span>{subItem.title}</span>
                {subItem.media_urls?.length > 0 && (
                  <span className="text-xs text-blue-200">
                    {subItem.media_urls.length} media items
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}