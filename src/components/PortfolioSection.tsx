import { ChevronDown } from 'lucide-react';
import type { PortfolioSection } from '../data/portfolioSections';

// Update interface to reflect that isExpanded is now a boolean comparison result
// and onToggle no longer needs parameters (we handle that in the parent)
interface PortfolioSectionProps {
  section: PortfolioSection;
  isExpanded: boolean;  // This is now computed in the parent (expandedSection === index)
  onToggle: () => void; // Parent component will pass the index handling
  onSubItemClick: (type: string, title: string, content: any) => void;
}

// The component implementation stays largely the same since we moved the logic to the parent
export function PortfolioSection({ 
  section, 
  isExpanded, 
  onToggle, 
  onSubItemClick 
}: PortfolioSectionProps) {
  return (
    <div className="relative">
      {/* Button remains the same as it just calls onToggle */}
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
          {/* ChevronDown animation stays the same */}
          <ChevronDown className={`w-5 h-5 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`} />
        </div>
      </button>
      
      {/* Conditional rendering and subItems mapping stays the same */}
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