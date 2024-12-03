import { supabase } from '../lib/supabase';

const defaultSections = [
  {
    title: 'Community Action',
    icon: 'Heart',
    color: '#004E98',
    description: 'Housing Justice & Community Building',
    order_index: 1
  },
  {
    title: 'Events',
    icon: 'Users',
    color: '#FF6700',
    description: 'Texas Toku Taisen & Cultural Events',
    order_index: 2
  },
  {
    title: 'Media',
    icon: 'Camera',
    color: '#3A6EA5',
    description: 'Video Production & Content Creation',
    order_index: 3
  },
  {
    title: 'Art & Illustration',
    icon: 'PenTool',
    color: '#FF6700',
    description: 'Digital Art & Traditional Illustrations',
    order_index: 4
  },
  {
    title: 'Development',
    icon: 'Code',
    color: '#004E98',
    description: 'Software & Web Solutions',
    order_index: 5
  }
];

const seedSections = async () => {
  // First, check if sections exist
  const { data: existingSections } = await supabase
    .from('sections')
    .select('*');

  if (!existingSections || existingSections.length === 0) {
    // Insert default sections if none exist
    const { data, error } = await supabase
      .from('sections')
      .insert(defaultSections)
      .select();

    if (error) {
      console.error('Error seeding sections:', error);
    } else {
      console.log('Successfully seeded sections:', data);
    }
  } else {
    console.log('Sections already exist:', existingSections);
  }
};

seedSections();