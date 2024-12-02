// components/subitems/SubItemForm.tsx
import React, { useState } from 'react';
import { CollapsibleSection } from '../CollapsibleSection';

interface SubItemFormProps {
  sectionId: string;
  onSubmit: (data: {
    section_id: string;
    title: string;
    description: string;
    media_urls: string[];
    media_types: string[];
    order: number;
  }) => void;
  onCancel?: () => void;
  initialData?: {
    title?: string;
    description?: string;
    media_urls?: string[];
    media_types?: string[];
    order?: number;
  } | null;
}

export const SubItemForm: React.FC<SubItemFormProps> = ({
  sectionId,
  onSubmit,
  onCancel,
  initialData = null
}) => {
  const [mediaFields, setMediaFields] = useState<Array<{ url: string; type: string }>>(
    initialData?.media_urls ? 
      initialData.media_urls.map((url, index) => ({
        url,
        type: initialData.media_types?.[index] || ''
      })) : 
      [{ url: '', type: '' }]
  );

  const addMediaField = () => {
    setMediaFields([...mediaFields, { url: '', type: '' }]);
  };

  const removeMediaField = (index: number) => {
    setMediaFields(mediaFields.filter((_, i) => i !== index));
  };

  const updateMediaUrl = (index: number, value: string) => {
    const newFields = [...mediaFields];
    newFields[index].url = value;
    setMediaFields(newFields);
  };

  const updateMediaType = (index: number, value: string) => {
    const newFields = [...mediaFields];
    newFields[index].type = value;
    setMediaFields(newFields);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const submissionData = {
      section_id: sectionId,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      media_urls: mediaFields.map(field => field.url),
      media_types: mediaFields.map(field => field.type),
      order: parseInt(formData.get('order') as string) || 0
    };

    onSubmit(submissionData);
    (e.target as HTMLFormElement).reset();
    setMediaFields([{ url: '', type: '' }]);
  };

  return (
    <CollapsibleSection
      title="Add Sub Item"
      description="Links to Lightbox Modal that will describe a portfolio entry."
      defaultOpen={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              defaultValue={initialData?.title}
              placeholder="Enter title"
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              name="order"
              defaultValue={initialData?.order}
              placeholder="Enter display order"
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={initialData?.description}
            placeholder="Enter description"
            rows={4}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">Media</label>
            <button
              type="button"
              onClick={addMediaField}
              className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              Add Media
            </button>
          </div>

          {mediaFields.map((field, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Media URL</label>
                <input
                  type="text"
                  value={field.url}
                  onChange={(e) => updateMediaUrl(index, e.target.value)}
                  placeholder="Enter media URL"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Media Type</label>
                <select
                  value={field.type}
                  onChange={(e) => updateMediaType(index, e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select type</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                </select>
              </div>
              {mediaFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMediaField(index)}
                  className="md:col-span-2 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Sub Item
          </button>
        </div>
      </form>
    </CollapsibleSection>
  );
};

export default SubItemForm;