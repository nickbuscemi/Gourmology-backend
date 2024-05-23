// Create a supabaseClient.js file under /utils or /config directory

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL; // Get this from your Supabase project API settings
const supabaseKey = 'Your-Supabase-Service-Role-Key'; // Get this from your Supabase project API settings

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
