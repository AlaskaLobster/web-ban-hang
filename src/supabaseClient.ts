// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Cấu hình Supabase với URL và API key của bạn
const supabaseUrl = 'https://qasmhyhihidvnvikgbrz.supabase.co';  // Thay bằng URL của bạn
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhc21oeWhpaGlkdm52aWtnYnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzODk4MzUsImV4cCI6MjA3NDk2NTgzNX0.KL7og9cbLxkQdwwFC7GugLZtuLzLWlvu9HOUfVGUCXY';  // Thay bằng API key của bạn

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
