import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          phone: string | null
          country: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          phone?: string | null
          country?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          country?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      quotes: {
        Row: {
          id: string
          text: string
          author: string
          category: string
          source: string | null
        }
        Insert: {
          id?: string
          text: string
          author: string
          category: string
          source?: string | null
        }
        Update: {
          id?: string
          text?: string
          author?: string
          category?: string
          source?: string | null
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string | null
          quote_id: string
          quote_data: any
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          quote_id: string
          quote_data: any
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          quote_id?: string
          quote_data?: any
          created_at?: string | null
        }
      }
      check_ins: {
        Row: {
          id: string
          user_id: string
          date: string
          click_count: number | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          click_count?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          click_count?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
        }
      }
      airtime_rewards: {
        Row: {
          id: string
          user_id: string
          amount: number
          phone: string
          status: string | null
          check_in_count: number
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          phone: string
          status?: string | null
          check_in_count: number
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          phone?: string
          status?: string | null
          check_in_count?: number
          created_at?: string | null
        }
      }
    }
  }
}