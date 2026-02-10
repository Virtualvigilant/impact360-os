export type UserRole = 'member' | 'mentor' | 'admin';
export type PipelineStage = 'intake' | 'training' | 'internal_projects' | 'evaluation' | 'client_ready' | 'deployed';
export type TrackType = 'web_development' | 'ai_ml' | 'design' | 'mobile' | 'devops';
export type ProjectStatus = 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'completed' | 'rejected';
export type ProjectDifficulty = 'beginner' | 'intermediate' | 'advanced';

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
  level: number;
  experience_points: number;
  is_client_ready: boolean;
  client_ready_date?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
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
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  member_id: string;
  status: ProjectStatus;
  assigned_at: string;
  started_at?: string;
  submitted_at?: string;
  completed_at?: string;
  project?: Project;
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