import { createClient } from '@supabase/supabase-js'
require('dotenv').config();


export class SupabaseWrapper {
    supabaseURL: string;
    supabaseAPIKey: string;
    supabase: any;
    tableName: string;
    
    constructor(tableName: string)
    {
        this.supabaseURL = process.env.SUPABASE_URL as string;
        this.supabaseAPIKey = process.env.SUPABASE_SERVICE_ROLE as string;
        this.supabase = createClient(this.supabaseURL, this.supabaseAPIKey);
        this.tableName = tableName;
    }

    public async insertData(dataToInsert: object, onConflict: string[] = ['case_id'])
    {
        try {
            const { error } = await this.supabase.from(this.tableName).upsert(
                dataToInsert, {
                onConflict: onConflict
            });
            if (error) {
                console.error('Error inserting data: ', error);
            } else {
                console.log('Data successfully inserted');
            }
        } catch (e) {
            console.error('Exception in insertData(): ', e);
        }
    }

    public async getData() {
        try {
            const { data, error } = await this.supabase.from(this.tableName).select(
                'case_id, case_text'
            )
            
            if (error) {
                console.error("Error Loading data from db. ", error);
                return null;
            } else {
                console.log("Data successfully loaded");
                return data;
            }
        } catch (e) {
            console.error('Exception in getData(): ', e);
        }
    }
}

