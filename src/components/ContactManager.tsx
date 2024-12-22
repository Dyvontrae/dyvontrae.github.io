import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

interface ContactCategory {
  id: number;
  name: string;
  notification_email: string;
  created_at: string;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  notification_email: string;
  created_at: string;
}

export default function ContactManager() {
  const [categories, setCategories] = useState<ContactCategory[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<ContactCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('contact_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      const { data: messagesData, error: messagesError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (currentCategory?.id) {
        const { error } = await supabase
          .from('contact_categories')
          .update({
            name: currentCategory.name,
            notification_email: currentCategory.notification_email
          })
          .eq('id', currentCategory.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contact_categories')
          .insert([{
            name: currentCategory?.name,
            notification_email: currentCategory?.notification_email
          }]);

        if (error) throw error;
      }
      
      setIsEditing(false);
      setCurrentCategory(null);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('contact_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="float-right text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Contact Categories</h2>
          <button 
            onClick={() => {
              setCurrentCategory({ id: 0, name: '', notification_email: '', created_at: '' });
              setIsEditing(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Category
          </button>
        </div>

        <div className="grid gap-4">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.notification_email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 border rounded hover:bg-gray-50"
                  onClick={() => {
                    setCurrentCategory(category);
                    setIsEditing(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 border rounded hover:bg-gray-50 text-red-600"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Contact Messages</h2>
        <div className="grid gap-4">
          {messages.map((message) => (
            <div key={message.id} className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <h3 className="font-medium">{message.subject}</h3>
                <span className="text-sm text-gray-600">
                  {new Date(message.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">From: {message.name} ({message.email})</p>
              <p className="text-sm">{message.message}</p>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <div className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {currentCategory?.id ? 'Edit Category' : 'New Category'}
            </h2>
            
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  className="w-full px-3 py-2 border rounded"
                  value={currentCategory?.name || ''}
                  onChange={(e) => setCurrentCategory(prev => 
                    prev ? { ...prev, name: e.target.value } : null
                  )}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notification Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded"
                  value={currentCategory?.notification_email || ''}
                  onChange={(e) => setCurrentCategory(prev => 
                    prev ? { ...prev, notification_email: e.target.value } : null
                  )}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentCategory(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}