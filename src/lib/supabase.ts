import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

interface Database {
  public: {
    Tables: {
      sections: {
        Row: {
          id: number
          title: string
          icon: string
          color: string
          description: string
          order_index: number
        }
      }
      sub_items: {
        Row: {
          id: number
          title: string
          description: string
          media_urls: string[]
          media_types: string[]
          section_id: number
        }
      }
    }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)