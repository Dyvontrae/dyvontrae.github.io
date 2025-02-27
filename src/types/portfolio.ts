import type { MediaItem } from '@/components/MediaUpload';

export interface PortfolioItem {
    title: string;
    description: string;
    image?: string;
    videoId?: string;
    thumbnail?: string;
}

export interface Section {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    order_index: number;
}

export interface SubItem {
    id: string;
    section_id: string;
    title: string;
    description: string;
    content?: PortfolioItem[];
    type?: 'gallery' | 'youtube';
    media_urls: string[];
    media_types: string[];
    order_index: number;
    media_items: MediaItem[];
}