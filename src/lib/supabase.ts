import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Habit {
  id: string
  user_id: string
  title: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly'
  target_count: number
  color: string
  category: string
  created_at: string
  updated_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  count: number
  notes?: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

// Predefined categories
export const HABIT_CATEGORIES = [
  'Health & Fitness',
  'Learning & Education',
  'Productivity',
  'Mindfulness',
  'Social',
  'Creative',
  'Financial',
  'Other'
] as const 