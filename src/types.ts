export interface Section {
    id?: string;
    title: string;
    icon: string;
    color: string;
    description: string;
    order_index: number;
  }
  
  export interface SubItem {
    id?: string;
    section_id: string;
    title: string;
    description: string;
    media_urls: string[];
    media_types: string[];
    modal_content?: {
      title: string;
      description: string;
      images?: string[];
    };
  }