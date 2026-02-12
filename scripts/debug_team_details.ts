
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugTeamDetails() {
    console.log('--- Step 1: Fetching a Team ID ---');
    const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id')
        .limit(1);

    if (teamsError) {
        console.error('Failed to fetch teams list:', teamsError);
        return;
    }

    if (!teams || teams.length === 0) {
        console.log('No teams found to test with.');
        return;
    }

    const teamId = teams[0].id;
    console.log(`Testing with Team ID: ${teamId}`);

    console.log('\n--- Step 2: Fetching Team Details with Members Join ---');
    const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select(`
            id,
            name,
            created_at,
            members:team_members(
                user_id,
                role,
                profile:profiles(full_name, avatar_url, email)
            )
        `)
        .eq('id', teamId)
        .single();

    if (teamError) {
        console.error('Team Fetch Error:', JSON.stringify(teamError, null, 2));
    } else {
        console.log('Team Fetch Success!');
        console.log('Member count:', teamData.members.length);
    }

    console.log('\n--- Step 3: Fetching Project Assignments ---');
    const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('project_assignments')
        .select(`
            id,
            status,
            started_at,
            completed_at,
            submitted_at,
            milestone_progress,
            project:projects(
                id,
                title,
                description,
                difficulty,
                deadline,
                milestones
            )
        `)
        .eq('team_id', teamId);

    if (assignmentsError) {
        console.error('Assignments Fetch Error:', JSON.stringify(assignmentsError, null, 2));
    } else {
        console.log('Assignments Fetch Success!');
        console.log('Assignments count:', assignmentsData.length);
    }
}

debugTeamDetails();
