import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing!');
  console.error('Please check your .env file contains:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_ANON_KEY');
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with enhanced options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-client-info': 'campusloop-web',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to check connection with retry
const checkConnection = async (retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
      
      if (!error) {
        console.log('✅ Supabase connection successful!');
        console.log(`📡 Connected to: ${supabaseUrl}`);
        console.log('🔐 Authentication ready');
        return true;
      }
      
      if (i < retries - 1) {
        console.warn(`⚠️ Connection attempt ${i + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (err) {
      if (i < retries - 1) {
        console.warn(`⚠️ Connection attempt ${i + 1} failed: ${err.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ Supabase connection failed after multiple attempts');
        console.error('💡 Possible issues:');
        console.error('   - Check your internet connection');
        console.error('   - Verify Supabase project is active');
        console.error('   - Check if Supabase is experiencing downtime');
        console.error('   - Try refreshing the page');
      }
    }
  }
  return false;
};

// Test connection on load
checkConnection();
