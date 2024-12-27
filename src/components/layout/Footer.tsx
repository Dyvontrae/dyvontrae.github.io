import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare, LinkedinIcon, YoutubeIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Footer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Commissions',
    message: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Save message to contact_messages table
      const { data: messageData, error: dbError } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      // Trigger email via Edge Function
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: { messageId: messageData.id }
      });

      if (emailError) throw emailError;

      setFormData({
        name: '',
        email: '',
        subject: 'Commissions',
        message: ''
      });
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <footer className="relative">
      <div className={`fixed bottom-0 left-0 right-0 bg-blue-900/80 backdrop-blur-md 
        transition-all duration-300 ease-in-out ${isExpanded ? 'h-96' : 'h-12'}`}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute left-1/2 -translate-x-1/2 -translate-y-8 
            bg-blue-900/80 backdrop-blur-md p-2 rounded-t-lg hover:bg-blue-800/80"
        >
          {isExpanded ? 
            <ChevronDown className="text-white w-5 h-5" /> : 
            <ChevronUp className="text-white w-5 h-5" />
          }
        </button>

        <div className="container mx-auto px-4 py-8 grid md:grid-cols-2 gap-8 h-full overflow-y-auto">
          <div className="space-y-4">                   
            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-md p-3">
                <p className="text-sm text-white">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                required
                className="w-full p-2 bg-blue-800/50 rounded border border-blue-700 text-white 
                  placeholder:text-blue-300"
              />
              
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="w-full p-2 bg-blue-800/50 rounded border border-blue-700 text-white 
                  placeholder:text-blue-300"
              />
              
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-2 bg-blue-800/50 rounded border border-blue-700 text-white"
              >
                <option value="Commissions">Commissions</option>
                <option value="Project Ideas">Project Ideas</option>
                <option value="Other">Other</option>
              </select>
              
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Message"
                required
                rows={4}
                className="w-full p-2 bg-blue-800/50 rounded border border-blue-700 text-white 
                  placeholder:text-blue-300"
              />
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full p-2 bg-orange-500 rounded hover:bg-orange-400 text-white 
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="space-y-4 text-white">
            <h3 className="text-xl">Let's Connect</h3>
            <div className="flex gap-4">
              <a href="https://discord.gg/yourdiscord" className="hover:text-blue-400 transition-colors">
                <MessageSquare className="w-6 h-6" />
              </a>
              <a href="https://linkedin.com/in/dyvontrae" className="hover:text-blue-400 transition-colors">
                <LinkedinIcon className="w-6 h-6" />
              </a>
              <a href="https://youtube.com/@dyvontrae" className="hover:text-blue-400 transition-colors">
                <YoutubeIcon className="w-6 h-6" />
              </a>
            </div>
            <p>Contact Me for Commission, Project Ideas and More</p>
            <p className="text-sm text-gray-300">
              Dyvontrae Johnson © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}