import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://drazdixobvyjrpefxlge.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYXpkaXhvYnZ5anJwZWZ4bGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NTU2MzIsImV4cCI6MjA5MzIzMTYzMn0.4dz5hZYEKP7XN85asTuuzuwz_nP_AxKFGElPmAMuvMA'
);
