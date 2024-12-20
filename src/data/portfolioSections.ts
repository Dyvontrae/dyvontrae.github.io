export interface PortfolioItem {
    title: string;
    description: string;
    image?: string;
    videoId?: string;
    thumbnail?: string;
  }
  
  export interface PortfolioSubItem {
    title: string;
    content: PortfolioItem[];
    type: 'gallery' | 'youtube';
  }
  
  export interface PortfolioSection {
    title: string;
    description: string;
    color: string;
    icon: string;
    subItems: PortfolioSubItem[];
  }
  
  export const portfolioSections: PortfolioSection[] = [
    // Your existing sections data
  ];