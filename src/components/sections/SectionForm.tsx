import React from 'react';
import { CollapsibleSection } from '../CollapsibleSection';
import { Section } from '../../types';

interface SectionFormProps {
  editingSection?: Section | null;
  onSubmit: (sectionData: Omit<Section, 'id'>) => Promise<void>;
  onCancel?: () => void;
}

export const SectionForm: React.FC<SectionFormProps> = ({
  editingSection = null,
  onSubmit,
  onCancel
}) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const sectionData: Omit<Section, 'id'> = {
      title: formData.get('title') as string,
      icon: formData.get('icon') as string,
      color: formData.get('color') as string,
      description: formData.get('description') as string,
      order_index: parseInt(formData.get('order_index') as string) // Changed from 'order'
    };
  
    await onSubmit(sectionData);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <CollapsibleSection
      title={editingSection ? 'Edit Section' : 'Add New Section'}
      description="Main Categories listed on the homepage of the portfolio."
      defaultOpen={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Section Title</label>
            <input
              type="text"
              name="title"
              defaultValue={editingSection?.title}
              placeholder="Enter section title"
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Icon Name</label>
            <input
              type="text"
              name="icon"
              defaultValue={editingSection?.icon}
              placeholder="Enter icon name"
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Color</label>
            <input
              type="color"
              name="color"
              defaultValue={editingSection?.color || "#004494"}
              className="w-full h-10 p-1 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              name="order_index" // Changed from 'order'
              defaultValue={editingSection?.order_index} // Changed from 'order'
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
            defaultValue={editingSection?.description}
            placeholder="Enter section description"
            rows={4}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          {editingSection && onCancel && (
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
            {editingSection ? 'Update' : 'Add'} Section
          </button>
        </div>
      </form>
    </CollapsibleSection>
  );
};