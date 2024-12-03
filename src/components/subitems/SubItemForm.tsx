interface SubItemFormProps {
  sectionId: string;
  editingItem?: {
    id: string;
    title: string;
    description: string;
  } | null;
  onSubmit: (data: {
    section_id: string;
    title: string;
    description: string;
    media_urls: string[];
    media_types: string[];
    order: number;
  }) => Promise<void>;
  onCancel?: () => void;
}

const SubItemForm = ({ 
  sectionId, 
  editingItem = null, 
  onSubmit,
  onCancel 
}: SubItemFormProps) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const subItemData = {
      section_id: sectionId,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      media_urls: [],
      media_types: [],
      order: 0
    };

    await onSubmit(subItemData);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-700 mb-1">Title</label>
        <input
          type="text"
          name="title"
          defaultValue={editingItem?.title}
          placeholder="Enter sub-item title"
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          defaultValue={editingItem?.description}
          placeholder="Enter sub-item description"
          rows={4}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        {editingItem && onCancel && (
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
          {editingItem ? 'Update' : 'Add'} Sub-item
        </button>
      </div>
    </form>
  );
};

export default SubItemForm;