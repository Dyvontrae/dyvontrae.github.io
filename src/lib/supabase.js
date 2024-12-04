import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hjivxgvosbylmvjjqvxi.supabase.co'
const supabaseAnonKey = 'YOeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaXZ4Z3Zvc2J5bG12ampxdnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzY2MjMsImV4cCI6MjA0ODY1MjYyM30.3PjqF1RRTtSohXr9VFk5lOScFp3mhOPzlVjS_gwwc2w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)