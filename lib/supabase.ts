import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client untuk operasi storage (menggunakan service role key untuk bypass RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

export default supabaseAdmin;

// Base URL untuk public url storage
export const STORAGE_PUBLIC_URL = `${supabaseUrl}/storage/v1/object/public`;
