import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY no están definidas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase conectado correctamente');

export default supabase;
