import { config } from 'dotenv';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

config.getConnection((err) => {
    if(err){
        console.log('Error de conexion a la base de datos', err);
        return;
    }   
    console.log('Conexion exitosa a la base de datos');
    connection.release();
});

module.exports = supabase;
