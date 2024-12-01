import React, { useState } from 'react';
import { X } from 'lucide-react';

const SubItemForm = ({ onSubmit, onCancel, initialData = null, sectionId }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    media_urls: [''],
    media_types: ['image'],
    section_id: sectionId,
    order_index: 0
  });

  const addMediaField = () => {
    setFormData(prev => ({
      ...prev,
      media_urls: [...prev.media_urls, ''],
      media_types: [...prev.media_types, 'image']
    }));
  };

  const removeMediaField = (index) => {
    setFormData(prev => ({
      ...prev,
      media_urls: prev.media_urls.filter((_, i) => i !== index),
      media_types: prev.media_types.filter((_, i) => i !== index)
    }));
  };

  const updateMediaUrl = (index, value) => {
    const newMediaUrls = [...formData.media_urls];
    newMediaUrls[index] = value;
    setFormData(prev => ({ ...prev, media_urls: newMediaUrls }));
  };

  const updateMediaType = (index, value) => {
    const newMediaTypes = [...formData.media_types];
    newMediaTypes[index] = value;
    setFormData(prev => ({ ...prev, media_types: newMediaTypes }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows="3"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Media</label>
        {formData.media_urls.map((url, index) => (
          <div key={index} className="flex gap-2 items-start">
            <select
              value={formData.media_types[index]}
              onChange={(e) => updateMediaType(index, e.target.value)}
              className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => updateMediaUrl(index, e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="URL"
            />
            <button
              type="button"
              onClick={() => removeMediaField(index)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-md"
            >
              <X size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addMediaField}
          className="mt-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
        >
          Add Media
        </button>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {initialData ? 'Update' : 'Create'} Item
        </button>
      </div>
    </form>
  );
};

export default SubItemForm;