// src/data/portfolioSections.ts
import type { Section, SubItem } from '../types/portfolio';

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
                {
                    url: '/api/placeholder/320/320',
                    type: 'image',
                    title: 'Housing Initiative',
                    description: 'Working with local communities to ensure housing justice'
                },
                {
                    url: '/api/placeholder/320/320',
                    type: 'image',
                    title: 'Community Support',
                    description: 'Building networks of mutual aid and support'
                }
            ]
        }
    ],
    'events': [
        {
            id: 'events-1',
            section_id: 'events',
            title: 'Past Events',
            description: 'Previous events and gatherings',
            type: 'gallery',
            order_index: 0,
            content: [
                {
                    title: 'Toku Taisen 2023',
                    description: 'Annual tokusatsu celebration and community gathering',
                    image: '/api/placeholder/320/320'
                }
            ],
            media_urls: ['/api/placeholder/320/320'],
            media_types: ['image'],
            media_items: [
                {
                    url: '/api/placeholder/320/320',
                    type: 'image',
                    title: 'Toku Taisen 2023',
                    description: 'Annual tokusatsu celebration and community gathering'
                }
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
            media_types: ['video', 'video'],
            media_items: [
                {
                    url: '/api/placeholder/320/180',
                    type: 'video',
                    title: 'Latest Production',
                    description: 'Latest video project showcasing community events'
                },
                {
                    url: '/api/placeholder/320/180',
                    type: 'video',
                    title: 'Featured Content',
                    description: 'Highlight reel of recent projects'
                }
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
                {
                    url: '/api/placeholder/320/320',
                    type: 'image',
                    title: 'Digital Art Collection',
                    description: 'Recent digital art works and commissions'
                }
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
                {
                    url: '/api/placeholder/320/320',
                    type: 'image',
                    title: 'Web Development',
                    description: 'Custom web solutions and applications'
                }
            ]
        }
    ]
};