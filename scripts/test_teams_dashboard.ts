
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('URL:', supabaseUrl);
// console.log('Key:', supabaseKey); // Don't log key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetchTeamsDashboard() {
    console.log('Testing fetch teams for dashboard...');
    const { data: teamsData, error } = await supabase
        .from('teams')
        .select(`
            *,
            members:team_members(
                user_id,
                role,
                profile:profiles(full_name, avatar_url)
            ),
            assignments:project_assignments(
                status,
                project:projects(title)
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error Object:', error);
        console.error('Error Message:', error.message);
        console.error('Error Details:', error.details);
        console.error('Error Hint:', error.hint);
        console.error('Error Code:', error.code);
    } else {
        console.log('Success! Teams found:', teamsData?.length);
        if (teamsData && teamsData.length > 0) {
            console.log('First team sample:', JSON.stringify(teamsData[0], null, 2));
        }
    }
}

testFetchTeamsDashboard();
