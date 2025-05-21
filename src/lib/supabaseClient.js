import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://uyqyjqfuyeuqhmcmmlsl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cXlqcWZ1eWV1cWhtY21tbHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzI2NTksImV4cCI6MjA2MzQwODY1OX0.xRkioq6o-L15cBy200GYBPHzVku1uQusEIw0Bd9IDtY";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing in supabaseClient.js. This should not happen if hardcoded.');
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.error("Supabase client could not be initialized. Check the hardcoded credentials in supabaseClient.js.");
}
