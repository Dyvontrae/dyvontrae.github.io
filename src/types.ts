export interface Section {
  id?: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  order_index: number;
}

export interface Media {
  type: 'file' | 'youtube';
  url: string;
  metadata: {
    title: string;
    description?: string;
    thumbnail?: string;
    altText?: string;
  };
}

export interface SubItem {
  id?: string;
  section_id: string;
  title: string;
  description: string;
  media_urls: string[];
  media_types: string[];
  media_items: Media[];  // This is crucial for YouTube content
  order_index: number;
  modal_content?: {
    title: string;
    description: string;
    images?: string[];
  };
}