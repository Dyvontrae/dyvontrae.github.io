import { supabase } from './supabase';

export type UploadError = {
  message: string;
  code?: string;
};

export type UploadResult = {
  url: string;
  path: string;
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFile(file: File): UploadError | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
      code: 'invalid_type'
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      message: 'File size exceeds 5MB limit.',
      code: 'file_too_large'
    };
  }

  return null;
}

export async function uploadMediaFile(
  file: File,
  folder: string = 'portfolio'
): Promise<UploadResult> {
  const validation = validateFile(file);
  if (validation) {
    throw new Error(validation.message);
  }

  // Create a unique file path
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from('portfolio_media')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('portfolio_media')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
    throw new Error('Failed to upload file');
  }
}

export async function deleteMediaFile(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('portfolio_media')
      .remove([path]);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
    throw new Error('Failed to delete file');
  }
}