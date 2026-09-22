import { createClient } from '@supabase/supabase-js';

// Replace these with your actual credentials from Supabase -> Project Settings -> API
const supabaseUrl = 'https://feixntbogkuckcpriseg.supabase.co';
const supabaseAnonKey = 'sb_publishable_KFCswgXq7G6P9o-59UskQA_JOcn86tF';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);