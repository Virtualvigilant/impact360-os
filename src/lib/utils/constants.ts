import { TrackType, PipelineStage, ProjectDifficulty } from '@/types/database.types';

export const TRACK_LABELS: Record<TrackType, string> = {
  web_development: 'Web Development',
  ai_ml: 'AI & Machine Learning',
  design: 'UI/UX Design',
  mobile: 'Mobile Development',
  devops: 'DevOps Engineering'
};

export const STAGE_LABELS: Record<PipelineStage, string> = {
  intake: 'Intake',
  training: 'Training',
  internal_projects: 'Internal Projects',
  evaluation: 'Evaluation',
  client_ready: 'Client Ready',
  deployed: 'Deployed'
};

export const STAGE_COLORS: Record<PipelineStage, string> = {
  intake: 'bg-gray-500',
  training: 'bg-blue-500',
  internal_projects: 'bg-purple-500',
  evaluation: 'bg-yellow-500',
  client_ready: 'bg-green-500',
  deployed: 'bg-emerald-600'
};

export const DIFFICULTY_LABELS: Record<ProjectDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced'
};

export const DIFFICULTY_COLORS: Record<ProjectDifficulty, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

export const EVALUATION_CRITERIA = [
  { key: 'code_quality', label: 'Code Quality' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'problem_solving', label: 'Problem Solving' },
  { key: 'communication', label: 'Communication' },
  { key: 'teamwork', label: 'Teamwork' },
  { key: 'reliability', label: 'Reliability' }
];