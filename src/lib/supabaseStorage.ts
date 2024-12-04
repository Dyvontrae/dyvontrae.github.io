import { supabase } from './supabase';
import type { Media } from '@/types/portfolio';

export const supabaseStorage = {
  async uploadMedia(file: File, itemId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${itemId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio_media')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('portfolio_media')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  async deleteMedia(url: string): Promise<void> {
    const filePath = url.split('/').pop();
    if (!filePath) return;

    const { error } = await supabase.storage
      .from('portfolio_media')
      .remove([filePath]);

    if (error) throw error;
  },

  async deleteMultipleMedia(mediaItems: Media[]): Promise<void> {
    const filePaths = mediaItems
      .filter(media => media.type === 'file' && media.url)
      .map(media => media.url!.split('/').pop())
      .filter((path): path is string => !!path);

    if (filePaths.length === 0) return;

    const { error } = await supabase.storage
      .from('portfolio_media')
      .remove(filePaths);

    if (error) throw error;
  }
};