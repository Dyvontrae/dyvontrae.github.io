import type { Section, SubItem, PortfolioItem } from '../types/portfolio';
import type { MediaItem } from '@/components/MediaUpload';

// Helper to create a media item
const createMediaItem = (
  url: string,
  type: 'image' | 'youtube',
  title: string,
  description: string
): MediaItem => ({
  url,
  type,
  title,
  description
});

export const portfolioSections: Section[] = [
    {
      id: 'community',
      title: 'Community Action',
      description: 'Housing Justice + Community Building',
      color: 'border-blue-400',
      icon: '❤️',
      order_index: 0,
    },
    {
      id: 'events',
      title: 'Events',
      description: 'Texas Toku Taisen & Cultural Events',
      color: 'border-orange-400',
      icon: '👥',
      order_index: 1,
    },
    {
      id: 'media',
      title: 'Media',
      description: 'Video Production & Content Creation',
      color: 'border-blue-400',
      icon: '📷',
      order_index: 2,
    },
    {
      id: 'art',
      title: 'Art & Illustration',
      description: 'Digital Art & Traditional Illustrations',
      color: 'border-orange-400',
      icon: '🎨',
      order_index: 3,
    },
    {
      id: 'dev',
      title: 'Development',
      description: 'Software & Web Solutions',
      color: 'border-blue-400',
      icon: '💻',
      order_index: 4,
    }
];

export const sectionSubItems: Record<string, SubItem[]> = {
    'community': [
        {
            id: 'community-1',
            section_id: 'community',
            title: 'Current Projects',
            description: 'Current community initiatives and projects',
            type: 'gallery',
            order_index: 0,
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
            media_urls: ['/api/placeholder/320/320', '/api/placeholder/320/320'],
            media_types: ['image', 'image'],
            media_items: [
                createMediaItem(
                    '/api/placeholder/320/320',
                    'image',
                    'Housing Initiative',
                    'Working with local communities to ensure housing justice'
                ),
                createMediaItem(
                    '/api/placeholder/320/320',
                    'image',
                    'Community Support',
                    'Building networks of mutual aid and support'
                )
            ]
        }
    ],
    'media': [
        {
            id: 'media-1',
            section_id: 'media',
            title: 'YouTube Channel',
            description: 'Video content and productions',
            type: 'youtube',
            order_index: 0,
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
            media_urls: ['/api/placeholder/320/180', '/api/placeholder/320/180'],
            media_types: ['youtube', 'youtube'],
            media_items: [
                createMediaItem(
                    'example1', // YouTube video ID
                    'youtube',
                    'Latest Production',
                    'Latest video project showcasing community events'
                ),
                createMediaItem(
                    'example2', // YouTube video ID
                    'youtube',
                    'Featured Content',
                    'Highlight reel of recent projects'
                )
            ]
        }
    ],
    'art': [
        {
            id: 'art-1',
            section_id: 'art',
            title: 'Portfolio',
            description: 'Art portfolio and collections',
            type: 'gallery',
            order_index: 0,
            content: [
                {
                    title: 'Digital Art Collection',
                    description: 'Recent digital art works and commissions',
                    image: '/api/placeholder/320/320'
                }
            ],
            media_urls: ['/api/placeholder/320/320'],
            media_types: ['image'],
            media_items: [
                createMediaItem(
                    '/api/placeholder/320/320',
                    'image',
                    'Digital Art Collection',
                    'Recent digital art works and commissions'
                )
            ]
        }
    ],
    'dev': [
        {
            id: 'dev-1',
            section_id: 'dev',
            title: 'Projects',
            description: 'Development projects and applications',
            type: 'gallery',
            order_index: 0,
            content: [
                {
                    title: 'Web Development',
                    description: 'Custom web solutions and applications',
                    image: '/api/placeholder/320/320'
                }
            ],
            media_urls: ['/api/placeholder/320/320'],
            media_types: ['image'],
            media_items: [
                createMediaItem(
                    '/api/placeholder/320/320',
                    'image',
                    'Web Development',
                    'Custom web solutions and applications'
                )
            ]
        }
    ]
};