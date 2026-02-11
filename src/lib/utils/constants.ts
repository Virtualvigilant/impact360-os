import { TrackType, PipelineStage, ProjectDifficulty, ExperienceLevel } from '@/types/database.types';

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
};

export const EXPERIENCE_DESCRIPTIONS: Record<ExperienceLevel, string> = {
    beginner: 'I\'m just starting out — little to no coding experience',
    intermediate: 'I have some experience — built personal projects or taken courses',
    advanced: 'I\'m experienced — worked professionally or on complex projects',
};

export const SKILL_OPTIONS: Record<TrackType, string[]> = {
    web_development: ['HTML/CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'SQL', 'MongoDB', 'GraphQL', 'REST APIs', 'Tailwind CSS', 'Git & GitHub'],
    ai_ml: ['Python', 'NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Data Visualization', 'SQL', 'Statistics', 'Deep Learning', 'Reinforcement Learning', 'LLMs & Prompt Engineering', 'Git & GitHub'],
    design: ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'UI Design', 'UX Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Typography', 'Color Theory', 'Responsive Design', 'Accessibility', 'Motion Design'],
    mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Dart', 'iOS Development', 'Android Development', 'Firebase', 'REST APIs', 'State Management', 'App Store Publishing', 'Push Notifications', 'Offline Storage', 'Git & GitHub'],
    devops: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible', 'Monitoring', 'Networking', 'Shell Scripting', 'Git & GitHub'],
};

export const INTEREST_OPTIONS = [
    'Frontend Development',
    'Backend Development',
    'Full-Stack Development',
    'Mobile Apps',
    'AI & Machine Learning',
    'Data Science',
    'UI/UX Design',
    'DevOps & Cloud',
    'Cybersecurity',
    'Blockchain',
    'Game Development',
    'Open Source',
    'Freelancing',
    'Startup Building',
    'Teaching & Mentoring',
];

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