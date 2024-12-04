import React, { useState } from 'react';
import { ChevronUp, Github, Linkedin, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const colors = {
  pumpkin: '#FF6700',
  antiFlashWhite: '#EBEBEB',
  silver: '#C0C0C0',
  biceBlue: '#3A6EA5',
  polynesianBlue: '#004E98'
} as const;

const Footer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const subjectOptions = [
    'Commission Request',
    'Project Collaboration',
    'Speaking Engagement',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: categoryData } = await supabase
        .from('contact_categories')
        .select('notification_email')
        .eq('name', formData.subject)
        .single();
  
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          ...formData,
          notification_email: categoryData?.notification_email
        }]);
  
      if (error) throw error;
      setFormData({ name: '', email: '', subject: '', message: '' });
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message');
    }
  };

  return (
    <div className="w-full bg-polynesianBlue/90 text-white relative z-10">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center py-2 hover:bg-polynesianBlue/70 transition-colors"
        style={{ backgroundColor: `${colors.polynesianBlue}CC` }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronUp className="w-6 h-6" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-8"
            style={{ backgroundColor: `${colors.polynesianBlue}CC` }}
          >
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full p-2 rounded bg-white/20 backdrop-blur"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 rounded bg-white/20 backdrop-blur"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <select
                  className="w-full p-2 rounded bg-white/20 backdrop-blur"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                >
                  <option value="">Select Subject</option>
                  {subjectOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <textarea
                  placeholder="Message"
                  className="w-full p-2 rounded bg-white/20 backdrop-blur h-32"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
                <button
                  type="submit"
                  className="w-full p-2 rounded"
                  style={{ backgroundColor: colors.pumpkin }}
                >
                  Send Message
                </button>
              </form>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Let's Connect</h3>
                  <div className="flex space-x-4">
                    <a href="https://github.com/dyvontrae" className="hover:text-pumpkin transition-colors">
                      <Github />
                    </a>
                    <a href="https://linkedin.com/in/dyvontrae" className="hover:text-pumpkin transition-colors">
                      <Linkedin />
                    </a>
                    <a href="https://youtube.com/@Dyvon.dynamo" className="hover:text-pumpkin transition-colors">
                      <Youtube />
                    </a>
                  </div>
                </div>
                <div className="text-silver">
                  <p>Dyvontrae Johnson © {new Date().getFullYear()}</p>
                  <p>Contact Me for Commission, Project Ideas and More</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Footer;