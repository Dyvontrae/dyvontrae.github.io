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
    {
      title: 'Community Action',
      description: 'Housing Justice + Community Building',
      color: 'border-blue-400',
      icon: '❤️',
      subItems: [
        { 
          title: 'Current Projects',
          content: [
            {
              title: 'Housing Initiative',
              description: 'Working with local communities to ensure housing justice',
              image: '/api/placeholder/320/320'
            },
            {
              title: 'Community Support',
              description: 'Building networks of mutual aid and support',
              image: '/api/placeholder/320/320'
            }
          ],
          type: 'gallery'
        }
      ]
    },
    {
      title: 'Events',
      description: 'Texas Toku Taisen & Cultural Events',
      color: 'border-orange-400',
      icon: '👥',
      subItems: [
        {
          title: 'Past Events',
          content: [
            {
              title: 'Toku Taisen 2023',
              description: 'Annual tokusatsu celebration and community gathering',
              image: '/api/placeholder/320/320'
            }
          ],
          type: 'gallery'
        }
      ]
    },
    {
      title: 'Media',
      description: 'Video Production & Content Creation',
      color: 'border-blue-400',
      icon: '📷',
      subItems: [
        {
          title: 'YouTube Channel',
          content: [
            {
              title: 'Latest Production',
              description: 'Latest video project showcasing community events',
              videoId: 'example1',
              thumbnail: '/api/placeholder/320/180'
            },
            {
              title: 'Featured Content',
              description: 'Highlight reel of recent projects',
              videoId: 'example2',
              thumbnail: '/api/placeholder/320/180'
            }
          ],
          type: 'youtube'
        }
      ]
    },
    {
      title: 'Art & Illustration',
      description: 'Digital Art & Traditional Illustrations',
      color: 'border-orange-400',
      icon: '🎨',
      subItems: [
        {
          title: 'Portfolio',
          content: [
            {
              title: 'Digital Art Collection',
              description: 'Recent digital art works and commissions',
              image: '/api/placeholder/320/320'
            }
          ],
          type: 'gallery'
        }
      ]
    },
    {
      title: 'Development',
      description: 'Software & Web Solutions',
      color: 'border-blue-400',
      icon: '💻',
      subItems: [
        {
          title: 'Projects',
          content: [
            {
              title: 'Web Development',
              description: 'Custom web solutions and applications',
              image: '/api/placeholder/320/320'
            }
          ],
          type: 'gallery'
        }
      ]
    }
];