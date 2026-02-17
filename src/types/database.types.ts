export type UserRole = 'member' | 'mentor' | 'admin';
export type PipelineStage = 'intake' | 'training' | 'internal_projects' | 'evaluation' | 'client_ready' | 'deployed';
export type TrackType = 'web_development' | 'ai_ml' | 'design' | 'mobile' | 'devops';
export type ProjectStatus = 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'completed' | 'rejected';
export type ProjectDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface MemberProfile {
    id: string;
    current_stage: PipelineStage;
    track?: TrackType;
    cohort_id?: string;
    bio?: string;
    skills?: string[];
    github_url?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    phone_number?: string;
    experience_level?: ExperienceLevel;
    interests?: string[];
    level: number;
    experience_points: number;
    is_client_ready: boolean;
    client_ready_date?: string;
    created_at: string;
    updated_at: string;
    profile?: Profile;
    completed_module_ids?: string[];
}

export interface Cohort {
    id: string;
    name: string;
    description?: string;
    track: TrackType;
    start_date: string;
    end_date?: string;
    is_active: boolean;
    mentor_ids?: string[];
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    difficulty: ProjectDifficulty;
    track: TrackType;
    skills_trained?: string[];
    tech_stack?: string[];
    deliverables?: string[];
    deadline?: string;
    cohort_id?: string;
    created_by?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    is_team_project?: boolean;
    milestones?: Record<string, any>[]; // JSONB: { id, title, description, deadline_offset }
}

export interface Team {
    id: string;
    name: string;
    project_id?: string;
    created_by?: string;
    is_active?: boolean;
    created_at: string;
}

export interface TeamMember {
    team_id: string;
    user_id: string;
    role?: 'leader' | 'member';
}

export interface ProjectAssignment {
    id: string;
    project_id: string;
    member_id: string;
    team_id?: string;
    status: ProjectStatus;
    assigned_at: string;
    started_at?: string;
    submitted_at?: string;
    completed_at?: string;
    project?: Project;
    team?: Team;
    milestone_progress?: Record<string, { status: 'pending' | 'completed'; completed_at?: string }>;
}

export interface Submission {
    id: string;
    assignment_id: string;
    member_id: string;
    project_id: string;
    github_url?: string;
    demo_url?: string;
    notes?: string;
    submitted_at: string;
    project?: Project;
}

export interface Evaluation {
    id: string;
    submission_id: string;
    member_id: string;
    evaluator_id: string;
    code_quality: number;
    architecture: number;
    problem_solving: number;
    communication: number;
    teamwork: number;
    reliability: number;
    average_score: number;
    feedback?: string;
    evaluated_at: string;
}

export interface Badge {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    criteria?: any;
    created_at: string;
    created_at_?: string; // Potential duplicate or typo in source, keeping consistent
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    related_id?: string;
    created_at: string;
}

export interface CurriculumModule {
    id: string;
    track: TrackType;
    title: string;
    topics: string[];
    duration: string;
    order_index: number;
    resources?: string[];
    created_at: string;
    updated_at: string;
}


export interface TeamInsert {
    id?: string;
    name: string;
    project_id?: string;
    created_by?: string;
    is_active?: boolean;
    created_at?: string;
}

export interface TeamMemberInsert {
    team_id: string;
    user_id: string;
    role?: 'leader' | 'member';
}

export interface NotificationInsert {
    id?: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    is_read?: boolean;
    related_id?: string;
    created_at?: string;
}

export interface MemberProfileInsert {
    id: string; // ID is usually required for profile linking to auth user
    current_stage?: PipelineStage;
    track?: TrackType;
    cohort_id?: string;
    bio?: string;
    skills?: string[];
    github_url?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    phone_number?: string;
    experience_level?: ExperienceLevel;
    interests?: string[];
    level?: number;
    experience_points?: number;
    is_client_ready?: boolean;
    client_ready_date?: string;
    created_at?: string;
    updated_at?: string;
    completed_module_ids?: string[];
}


export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile
                Insert: Profile
                Update: Partial<Profile>
            }
            member_profiles: {
                Row: MemberProfile
                Insert: MemberProfileInsert
                Update: Partial<MemberProfile>
            }
            cohorts: {
                Row: Cohort
                Insert: Cohort
                Update: Partial<Cohort>
            }
            projects: {
                Row: Project
                Insert: Project
                Update: Partial<Project>
            }
            teams: {
                Row: Team
                Insert: TeamInsert
                Update: Partial<Team>
            }
            team_members: {
                Row: TeamMember
                Insert: TeamMemberInsert
                Update: Partial<TeamMember>
            }
            project_assignments: {
                Row: ProjectAssignment
                Insert: ProjectAssignment
                Update: Partial<ProjectAssignment>
            }
            submissions: {
                Row: Submission
                Insert: Submission
                Update: Partial<Submission>
            }
            evaluations: {
                Row: Evaluation
                Insert: Evaluation
                Update: Partial<Evaluation>
            }
            badges: {
                Row: Badge
                Insert: Badge
                Update: Partial<Badge>
            }
            notifications: {
                Row: Notification
                Insert: NotificationInsert
                Update: Partial<Notification>
            }
            curriculum_modules: {
                Row: CurriculumModule
                Insert: CurriculumModule
                Update: Partial<CurriculumModule>
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: UserRole
            pipeline_stage: PipelineStage
            track_type: TrackType
            project_status: ProjectStatus
            project_difficulty: ProjectDifficulty
            experience_level: ExperienceLevel
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}