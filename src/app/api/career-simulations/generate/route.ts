import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

// --- Specific Types for Simulation Step Content ---

interface VideoStepContent {
  video_url: string;
  key_points?: string[];
  reflection_questions?: string[];
}

interface QuizQuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizQuestionOption[];
}

interface QuizStepContent {
  questions: QuizQuestion[];
  passing_score?: number;
}

interface InteractiveTaskResource {
  title: string;
  url: string;
  type?: 'link' | 'document' | 'video';
}

interface InteractiveTaskStepContent {
  task_description: string;
  success_criteria?: string[];
  resources?: InteractiveTaskResource[];
}

interface ReflectionPrompt {
  id: string;
  text: string;
  min_words?: number;
  example_response?: string;
}

interface ReflectionStepContent {
  prompts: ReflectionPrompt[];
}

// Union type for step content
type SimulationStepContent =
  | VideoStepContent
  | QuizStepContent
  | InteractiveTaskStepContent
  | ReflectionStepContent
  | Record<string, unknown>; // Fallback for unknown/other types

// --- Types for Simulation Generation ---

interface SimulationPrompt {
  occupation: {
    code: string;
    title: string;
    description: string;
    tasks: string[];
    skills: string[];
    knowledge: string[];
    work_activities: string[];
    work_context: string[];
    interests: string[];
  };
}

// Updated step type using the union content type
interface GeneratedSimulationStep {
  step_number: number;
  step_type: 'video' | 'quiz' | 'interactive_task' | 'reflection';
  title: string;
  description: string;
  content: SimulationStepContent;
}

// Updated simulation type
interface GeneratedSimulation {
  title: string;
  description: string;
  difficulty_level: number; // Keep as number for DB compatibility
  estimated_duration_minutes: number;
  steps: GeneratedSimulationStep[];
}

// Removed unused type guards

export async function POST(request: Request) {
  const supabase = await createClient();
  
  try {
    const { occupation_code } = await request.json();

    // Fetch occupation details
    const { data: occupation, error: occError } = await supabase
      .from('occupations')
      .select('*')
      .eq('code', occupation_code)
      .single();

    if (occError || !occupation) {
      throw new Error('Occupation not found');
    }

    // Prepare prompt for simulation generation
    const prompt: SimulationPrompt = { // Added type annotation
      occupation: {
        code: occupation.code,
        title: occupation.title,
        description: occupation.description,
        tasks: occupation.tasks || [],
        skills: occupation.skills || [],
        knowledge: occupation.knowledge || [],
        work_activities: occupation.work_activities || [],
        work_context: occupation.work_context || [],
        interests: occupation.interests || []
      }
    };

    // Generate simulation using AI
    const simulation = await generateSimulation(prompt);

    // Save simulation to database
    const { data: savedSimulation, error: saveError } = await supabase
      .from('career_scenarios')
      .insert({
        onet_code: occupation_code,
        title: simulation.title,
        description: simulation.description,
        // Convert difficulty level string back to number if needed, or adjust DB schema
        difficulty_level: simulation.difficulty_level, // Assuming DB expects number
        estimated_duration_minutes: simulation.estimated_duration_minutes,
        points_reward: simulation.difficulty_level * 100, // Points based on difficulty
      })
      .select()
      .single();

    if (saveError) throw saveError;

    // Save simulation steps
    const { error: stepsError } = await supabase
      .from('scenario_steps')
      .insert(
        simulation.steps.map(step => ({
          scenario_id: savedSimulation.id,
          step_number: step.step_number,
          step_type: step.step_type,
          title: step.title,
          description: step.description,
          content: step.content // Content is already processed
        }))
      );

    if (stepsError) throw stepsError;

    return NextResponse.json({ success: true, simulation: savedSimulation });
  } catch (error) {
    console.error('Error generating simulation:', error);
    return NextResponse.json(
      { error: 'Failed to generate simulation' },
      { status: 500 }
    );
  }
}

async function generateSimulation(prompt: SimulationPrompt): Promise<GeneratedSimulation> {
  const systemPrompt = `You are an expert career simulation designer. Your task is to create an engaging, realistic simulation of a day in the life of a ${prompt.occupation.title}. 
The simulation should:
1. Be educational and realistic, based on actual job tasks and responsibilities
2. Include a mix of different activity types (video scenarios, quizzes, interactive tasks, reflections)
3. Progress from basic to more complex tasks
4. Take 30-45 minutes to complete
5. Include clear success criteria and learning objectives

Use the provided occupation data to ensure accuracy and realism.`;

  const userPrompt = `Create a career simulation for ${prompt.occupation.title}. Include:
- A compelling title and description
- 4-6 steps that progress logically
- A mix of different activity types
- Realistic scenarios based on these job tasks: ${prompt.occupation.tasks.slice(0, 3).join(', ')}
- Required skills: ${prompt.occupation.skills.slice(0, 3).join(', ')}
- Work activities: ${prompt.occupation.work_activities.slice(0, 3).join(', ')}

Format the response as a JSON object with:
{
  "title": "string",
  "description": "string",
  "difficulty_level": number (1-5),
  "estimated_duration_minutes": number,
  "steps": [{
    "step_number": number, // AI should generate this, we'll override later
    "step_type": "video" | "quiz" | "interactive_task" | "reflection",
    "title": "string",
    "description": "string",
    "content": object // Structure depends on step_type
  }]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" }
  });

  const messageContent = completion.choices[0].message.content;
  if (!messageContent) {
    throw new Error('Failed to generate simulation content');
  }

  // Parse the potentially loosely typed response from the AI
  const simulationData = JSON.parse(messageContent) as Partial<GeneratedSimulation> & { steps?: Partial<GeneratedSimulationStep>[] };
  
  // Validate and process the generated content
  const processedSteps = (simulationData.steps || []).map((step, index): GeneratedSimulationStep => {
    // Ensure step has a valid type, default if necessary
    const stepType = (['video', 'quiz', 'interactive_task', 'reflection'] as const).includes(step?.step_type) // Removed 'as any'
      ? step.step_type as GeneratedSimulationStep['step_type']
      : 'reflection'; // Default to reflection if type is invalid

    return {
      step_number: index + 1, // Override AI step number with correct sequence
      step_type: stepType,
      title: step?.title || `Step ${index + 1}`,
      description: step?.description || 'Complete this step.',
      content: processStepContent(stepType, step?.content || {}) // Process content based on determined type
    };
  });

  return {
    title: simulationData.title || `Simulation for ${prompt.occupation.title}`,
    description: simulationData.description || `An interactive simulation for ${prompt.occupation.title}.`,
    difficulty_level: Math.min(Math.max(1, simulationData.difficulty_level || 1), 5),
    estimated_duration_minutes: Math.min(Math.max(15, simulationData.estimated_duration_minutes || 30), 60),
    steps: processedSteps
  };
}

// Updated function signature with stepType parameter and using unknown for content
function processStepContent(stepType: GeneratedSimulationStep['step_type'], content: unknown): SimulationStepContent { // Changed 'any' back to 'unknown'
  switch (stepType) {
    case 'video':
      // Assuming content might have video details
      const videoContent = content as Partial<VideoStepContent>; // Assert type cautiously
      return {
        video_url: generateVideoScenario(content), // Pass the whole content object
        key_points: videoContent?.key_points || [],
        reflection_questions: videoContent?.reflection_questions || []
      };
    case 'quiz':
      // Assuming content might have quiz details
      const quizContent = content as Partial<QuizStepContent>; // Assert type cautiously
      const questions = (quizContent?.questions || []).map((q: unknown): QuizQuestion => { // Type q as unknown
        const questionData = q as Partial<QuizQuestion>; // Assert type cautiously
        return {
          id: generateId(),
          text: questionData?.text || 'Unnamed Question',
          options: (questionData?.options || []).map((opt: unknown): QuizQuestionOption => { // Type opt as unknown
            const optionData = opt as Partial<QuizQuestionOption>; // Assert type cautiously
            return {
              id: generateId(),
              text: optionData?.text || 'Unnamed Option',
              is_correct: !!optionData?.is_correct // Ensure boolean
            };
          })
        };
      });
      return {
        questions: questions,
        passing_score: quizContent?.passing_score || 70
      };
    case 'interactive_task':
      // Assuming content might have task details
      const taskContent = content as Partial<InteractiveTaskStepContent>; // Assert type cautiously
      return {
        task_description: taskContent?.task_description || 'Complete the interactive task.',
        success_criteria: taskContent?.success_criteria || [],
        resources: (taskContent?.resources || []).map((r: unknown): InteractiveTaskResource => { // Type r as unknown
          const resourceData = r as Partial<InteractiveTaskResource>; // Assert type cautiously
          return {
            title: resourceData?.title || 'Resource',
            url: resourceData?.url || '#',
            type: resourceData?.type || 'link'
          };
        })
      };
    case 'reflection':
      // Assuming content might have reflection details
      const reflectionContent = content as Partial<ReflectionStepContent>; // Assert type cautiously
      return {
        prompts: (reflectionContent?.prompts || []).map((p: unknown): ReflectionPrompt => { // Type p as unknown
          const promptData = p as Partial<ReflectionPrompt>; // Assert type cautiously
          return {
            id: generateId(),
            text: promptData?.text || 'Reflect on your experience.',
            min_words: promptData?.min_words || 50,
            example_response: promptData?.example_response
          };
        })
      };
    default:
      // Should not happen with the type guard, but return raw content as fallback
      return content as Record<string, unknown>; // Keep fallback assertion
  }
}

// Updated function signature
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateVideoScenario(content: unknown): string { // Use unknown type
  // For now, return a placeholder video URL
  // In the future, this could generate videos using AI based on the content
  // Example: if (isVideoStepContent(content)) { /* use content.key_points */ }
  return 'https://youni-dev.s3.amazonaws.com/career-simulations/placeholder-video.mp4';
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
