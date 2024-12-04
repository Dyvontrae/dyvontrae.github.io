export interface Media {
    type: 'file' | 'youtube';
    url?: string;
    file?: File;
    metadata: {
      title: string;
      description?: string;
      thumbnail?: string;
      altText?: string;
    };
  }
  
  export interface SubItem {
    id: string;
    title: string;
    description: string;
    section_id: string;
    media_urls: string[];
    media_types: string[];
    media_items?: Media[];
    order_index: number;
  }
  
  export interface SubItemFormData {
    section_id: string;
    title: string;
    description: string;
    media_urls: string[];
    media_types: string[];
    order: number;
  }
  
  export interface Section {
    id: string;
    title: string;
    description: string;
    order_index: number;
  }