import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Section, SubItem } from '@/types/portfolio';
import { MarkdownDisplay } from '@/components/MarkdownDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Gallery } from '@/components/Gallery';
import { VideoEmbed } from '@/components/VideoEmbed';
import type { MediaItem } from '@/components/MediaUpload';

interface PortfolioSectionProps {
  section: Section;
  subItems: SubItem[];
  isExpanded: boolean;
  onToggle: () => void;
  onEditSection?: (section: Section) => void;
  onEditSubItem?: (subItem: SubItem) => void;
  onAddSubItem?: () => void;
}

const iconMap: Record<string, string> = {
  Heart: '❤️',
  Users: '👥',
  Camera: '📷',
  PenTool: '🎨',
  Code: '💻',
  School: '🎓'
};

export function PortfolioSection({ 
  section,
  subItems, 
  isExpanded, 
  onToggle,
  onEditSection,
  onEditSubItem,
  onAddSubItem
}: PortfolioSectionProps) {
  const [selectedSubItem, setSelectedSubItem] = useState<SubItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

    // Add debug logs for initial props
    useEffect(() => {
        console.log('Section:', section);
        console.log('SubItems:', subItems);
    }, [section, subItems]);

    // Add debug log for selected item
    useEffect(() => {
        if (selectedSubItem) {
        console.log('Selected SubItem:', selectedSubItem);
        console.log('Media Items:', selectedSubItem.media_items);
        }
    }, [selectedSubItem]);

    // Modify the click handler
    const handleSubItemClick = (subItem: SubItem) => {
        console.log('SubItem clicked:', subItem);
        console.log('SubItem media_items:', subItem.media_items);
        setSelectedSubItem(subItem);
        setIsModalOpen(true);
    };  

    const renderModalContent = (subItem: SubItem) => {
      console.log('Rendering modal for subItem:', subItem);
      
      if (!subItem.media_items?.length) {
        return <p className="text-gray-400">No media content available</p>;
      }
    
      // Transform the media items to match expected format
      const transformedMediaItems: MediaItem[] = subItem.media_items
        .filter(item => item.url) // Ensure we have a valid URL
        .map(item => {
          // Check if this is a YouTube URL/ID
          const isYouTube = 
            subItem.type === 'youtube' || 
            item.type === 'youtube' ||
            (typeof item.url === 'string' && (
              item.url.includes('youtube.com') || 
              item.url.includes('youtu.be')
            ));
    
          console.log('Processing item:', item);
          console.log('Is YouTube?', isYouTube);
    
          return {
            url: item.url,
            type: isYouTube ? 'youtube' : 'image',
            title: item.title || '',
            description: item.description || '',
            storagePath: item.storagePath
          };
        });
    
      console.log('Transformed media items:', transformedMediaItems);
    
      // If any item is YouTube, render video embeds
      const hasYouTubeItems = transformedMediaItems.some(item => item.type === 'youtube');
      if (hasYouTubeItems || subItem.type === 'youtube') {
        return (
          <div className="space-y-4">
            {transformedMediaItems.map((item, index) => (
              item.type === 'youtube' ? (
                <VideoEmbed 
                  key={index}
                  videoId={item.url}
                  title={item.title}
                />
              ) : (
                <img 
                  key={index}
                  src={item.url}
                  alt={item.title || ''}
                  className="w-full rounded-lg"
                />
              )
            ))}
          </div>
        );
      }
    
      // If no YouTube items, use Gallery component
      return <Gallery items={transformedMediaItems} />;
    };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`w-full bg-white/10 backdrop-blur-sm rounded-lg p-4 
border-l-4 border-[${section.color}] hover:bg-white/15 transition-all
shadow-lg text-white backdrop-saturate-150`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl">{iconMap[section.icon] || section.icon}</span>
            <div>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <div className="text-blue-200 text-sm">
                <MarkdownDisplay content={section.description} />
              </div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`} />
        </div>
      </button>
      
      {isExpanded && (
        <div className="mt-1 space-y-2">
          {subItems.map((subItem) => (
            <button
              key={subItem.id}
             onClick={() => handleSubItemClick(subItem)}
             className="w-full bg-white/5 rounded-lg p-3 text-left text-white hover:bg-white/10"
            >
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{subItem.title}</span>
                  {subItem.media_items?.length > 0 && (
                    <span className="text-xs text-blue-200">
                      {subItem.media_items.length} media items
                    </span>
                  )}
                </div>
                {subItem.description && (
                  <p className="text-sm text-gray-300">{subItem.description}</p>
                )}
              </div>
            </button>
          ))}
         
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>
              {selectedSubItem?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedSubItem?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedSubItem && renderModalContent(selectedSubItem)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}