// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This is our standard client for public operations (fetching the grid, etc.)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)