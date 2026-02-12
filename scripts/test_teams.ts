
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetchTeams() {
    console.log('Testing fetch teams...');
    const { data, error } = await supabase
        .from('teams')
        .select('*, members:team_members(count)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success! Teams found:', data?.length);
        console.log('Data:', JSON.stringify(data, null, 2));
    }
}

testFetchTeams();
