import { createClient } from '@supabase/supabase-js'
require('dotenv').config();

const supabaseURL = process.env.SUPABASE_URL;
const supabaseAPIKey = process.env.SUPABASE_API_KEY;

const supabase = createClient(supabaseURL, supabaseAPIKey);

const tableName = "cases";


export async function insertData(dataToInsert: object)
{
    try {
        const { data, error } = await supabase.from(tableName).upsert(dataToInsert);
        if (error) {
            console.error('Error inserting data: ', error);
        } else {
            console.log('Data successfully inserted', data);
        }
    } catch (e) {
        console.error('Error:', e);
    }
}