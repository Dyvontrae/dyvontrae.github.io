import { PortfolioSection } from '../src/components/PortfolioSection'
import { useState } from 'react'
import { portfolioSections } from '../src/data/portfolioSections'

export default function Home() {
  // State for managing which section is expanded
  const [expandedSection, setExpandedSection] = useState<boolean>(false);

  // Handler for toggling sections
  const handleToggle = () => {
    setExpandedSection(!expandedSection);
  };

  // Handler for sub-item clicks
  const handleSubItemClick = (type: string, title: string, content: any) => {
    // Handle sub-item clicks here
    console.log(type, title, content);
  };

  // Return the first section for now (we can map through all sections later)
  return <PortfolioSection 
    section={portfolioSections[0]}
    isExpanded={expandedSection}
    onToggle={handleToggle}
    onSubItemClick={handleSubItemClick}
  />
}