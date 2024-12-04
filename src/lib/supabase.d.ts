declare module './lib/supabase' {
    import { SupabaseClient } from '@supabase/supabase-js'
  
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
  
    export const supabase: SupabaseClient<Database>
  }