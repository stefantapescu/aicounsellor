export type StepType = 'quiz' | 'interactive_task' | 'reflection';

export interface SimulationStep {
  id: string;
  type: 'quiz' | 'interactive_task' | 'reflection';
  title: string;
  description: string;
  content: {
    questions?: Array<{
      id: string;
      text: string;
      options: string[];
      correctAnswer: number;
    }>;
    tasks?: Array<{
      id: string;
      text: string;
      hint?: string;
    }>;
    prompts?: Array<{
      id: string;
      text: string;
      minWords?: number;
      example?: string;
    }>;
  };
  sequence_number?: number;
}

export interface CareerScenario {
  id: string;
  title: string;
  description: string;
  onet_code: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_minutes: number;
  points_reward: number;
  steps: SimulationStep[];
  created_at: string;
  updated_at: string;
}

export interface ScenarioStep {
  id: string;
  scenario_id: string;
  step_number: number;
  title: string;
  description: string;
  step_type: StepType;
  content: VideoContent | QuizContent | InteractiveTaskContent | ReflectionContent;
  created_at: string;
  updated_at: string;
}

export interface VideoContent {
  video_url: string;
  transcript?: string;
  duration_seconds: number;
  key_points: string[];
}

export interface QuizContent {
  questions: {
    id: string;
    text: string;
    options: {
      id: string;
      text: string;
      is_correct: boolean;
      explanation: string;
    }[];
  }[];
  passing_score: number;
}

export interface InteractiveTaskContent {
  task_description: string;
  success_criteria: string[];
  resources: {
    title: string;
    url: string;
    type: 'document' | 'video' | 'tool';
  }[];
  submission_type: 'text' | 'file' | 'multiple_choice';
  submission_instructions: string;
}

export interface ReflectionContent {
  prompts: string[];
  min_words_per_prompt: number;
  example_responses?: string[];
}

export interface UserScenarioProgress {
  id: string;
  user_id: string;
  scenario_id: string;
  current_step: number;
  completed: boolean;
  score?: number;
  completed_steps: string[];
  started_at: string;
  completed_at?: string;
  last_activity_at: string;
}

export interface ScenarioResponse {
  id: string;
  user_id: string;
  scenario_id: string;
  step_id: string;
  response_data: VideoResponse | QuizResponse | InteractiveTaskResponse | ReflectionResponse;
  created_at: string;
  updated_at: string;
}

export interface VideoResponse {
  watched_duration_seconds: number;
  completed: boolean;
  notes?: string;
}

export interface QuizResponse {
  answers: {
    question_id: string;
    selected_option_id: string;
    is_correct: boolean;
  }[];
  score: number;
  completed: boolean;
  attempts: number;
}

export interface InteractiveTaskResponse {
  submission: {
    type: 'text' | 'file' | 'multiple_choice';
    content: string | string[]; // Text content or file URLs
  };
  completed: boolean;
  feedback?: string;
  score?: number;
}

export interface ReflectionResponse {
  responses: {
    prompt_index: number;
    text: string;
    word_count: number;
  }[];
  completed: boolean;
} 