import { createClient } from '@supabase/supabase-js'
require('dotenv').config("../.env");


export class SupabaseWrapper {
    supabaseURL: string;
    supabaseAPIKey: string;
    supabase: any;
    tableName: string;
    
    constructor()
    {
        this.supabaseURL = process.env.SUPABASE_URL as string;
        this.supabaseAPIKey = process.env.SUPABASE_API_KEY as string;
        this.supabase = createClient(this.supabaseURL, this.supabaseAPIKey);
        this.tableName = "cases";
    }

    async insertData(dataToInsert: object)
    {
        try {
            const { data, error } = await this.supabase.from(this.tableName).upsert(dataToInsert);
            if (error) {
                console.error('Error inserting data: ', error);
            } else {
                console.log('Data successfully inserted', data);
            }
        } catch (e) {
            console.error('Error:', e);
        }
    }
}

