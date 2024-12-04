import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema for reference
/**
 * @typedef {Object} Section
 * @property {number} id
 * @property {string} title
 * @property {string} icon
 * @property {string} color
 * @property {string} description
 * @property {number} order_index
 * 
 * @typedef {Object} SubItem
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string[]} media_urls
 * @property {string[]} media_types
 * @property {number} section_id
 */