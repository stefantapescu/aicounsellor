// --- Define Question Structure ---
// These types are needed by the data definitions below

// Define all possible section IDs
export type SectionId =
  | 'warmup'
  | 'interests' // RIASEC
  | 'personality' // Big Five
  | 'aptitude' // Cognitive skills
  | 'skills' // Practical skills/confidence AND enjoyment
  // | 'skills_enjoyment' // Removed - Merged into 'skills'
  | 'values' // Work values
  | 'learning_style' // VARK
  | 'goals'; // Open-ended goals

export type BaseAssessmentQuestion = {
  id: string; // Unique ID for the question itself
  sectionId: SectionId;
  text: string; // The question text
};

// Represents an option in a multiple-choice question
export type ChoiceOption = {
    id: string; // Unique ID for the option within the question (e.g., 'a', 'b', '1', 'option_visual')
    text: string;
    theme?: string; // Optional theme (e.g., RIASEC code 'R', 'I', 'A', 'S', 'E', 'C')
    learningStyle?: 'V' | 'A' | 'R' | 'K'; // Optional VARK learning style mapping
};

export type WarmupChoiceQuestion = BaseAssessmentQuestion & {
  sectionId: 'warmup';
  inputType: 'multiple_choice'; // Simple multiple choice for warmup
  options: ChoiceOption[];
};

export type ScenarioChoiceQuestion = BaseAssessmentQuestion & {
  sectionId: 'interests' | 'skills'; // Scenarios for interests and some skills
  inputType: 'scenario_choice';
  options: ChoiceOption[];
};

// Specific type for Likert scale rating (Skills, Values, Personality, Skill Enjoyment)
export type LikertQuestion = BaseAssessmentQuestion & {
  // Removed 'skills_enjoyment' from sectionId list
  sectionId: 'skills' | 'values' | 'personality';
  inputType: 'likert';
  // Keep scaleType to differentiate enjoyment questions within 'skills' section
  scaleType: 'skill_confidence' | 'value_importance' | 'skill_enjoyment' | 'personality_agreement';
};

// Specific type for Aptitude questions (Multiple Choice with a correct answer)
export type AptitudeQuestion = BaseAssessmentQuestion & {
    sectionId: 'aptitude';
    inputType: 'multiple_choice'; // Aptitude questions are typically MC
    options: ChoiceOption[];
    correctAnswerId: string; // The ID of the correct ChoiceOption
};

// Specific type for Learning Style questions (Multiple Choice mapping to styles)
export type LearningStyleQuestion = BaseAssessmentQuestion & {
    sectionId: 'learning_style';
    inputType: 'multiple_choice'; // Simple MC for learning style preference
    options: ChoiceOption[]; // Options should have learningStyle property set
};


export type MiniChallengeQuestion = BaseAssessmentQuestion & {
    sectionId: 'skills';
    inputType: 'mini_challenge_text' | 'mini_challenge_textarea';
    followUpQuestion: LikertQuestion; // Follow up with enjoyment rating
};

export type ValueRankingQuestion = BaseAssessmentQuestion & {
    sectionId: 'values';
    inputType: 'value_ranking';
    dependsOnRatings: boolean; // Flag to indicate dependency
};

export type TextareaQuestion = BaseAssessmentQuestion & {
  sectionId: 'goals';
  inputType: 'textarea';
};

// Union type
export type AssessmentQuestion =
  | WarmupChoiceQuestion
  | ScenarioChoiceQuestion
  | MiniChallengeQuestion
  | LikertQuestion
  | AptitudeQuestion // Added
  | LearningStyleQuestion // Added
  | ValueRankingQuestion
  | TextareaQuestion;


// --- Define Questions Data (Combined and Ordered) ---

export const warmupQuestions: WarmupChoiceQuestion[] = [
    {
        id: 'warmup_sidekick', sectionId: 'warmup', inputType: 'multiple_choice',
        text: "If you could have any animal as your loyal sidekick on daily adventures, which one would you choose?",
        options: [
          { id: 'parrot', text: 'A persuasive parrot' }, { id: 'monkey', text: 'A tech-savvy monkey' },
          { id: 'dolphin', text: 'A caring dolphin' }, { id: 'owl', text: 'A wise owl' },
          { id: 'chameleon', text: 'A creative chameleon' }
        ]
    },
    {
        id: 'warmup_superpower', sectionId: 'warmup', inputType: 'multiple_choice',
        text: "If you could instantly gain one new superpower, what would it be?",
        options: [
          { id: 'mind_read', text: 'Read minds' }, { id: 'teleport', text: 'Teleport anywhere' },
          { id: 'talk_animal', text: 'Talk to animals' }, { id: 'strength', text: 'Super strength' },
          { id: 'control_tech', text: 'Control technology' }
        ]
    }
];

export const interestScenarios: ScenarioChoiceQuestion[] = [
  {
    id: 'interest_scenario_1', sectionId: 'interests', inputType: 'scenario_choice',
    text: "Imagine you're planning a school event. Which role would you prefer?",
    options: [
      { id: '1a', text: 'Designing the posters and decorations', theme: 'A' },
      { id: '1b', text: 'Organizing the budget and schedule', theme: 'C' },
      { id: '1c', text: 'Leading the planning committee and delegating tasks', theme: 'E' },
      { id: '1d', text: 'Researching different venue options and comparing them', theme: 'I' },
      { id: '1e', text: 'Setting up the sound system and equipment', theme: 'R' },
      { id: '1f', text: 'Welcoming guests and making sure everyone feels included', theme: 'S' },
    ]
  },
   {
    id: 'interest_scenario_2', sectionId: 'interests', inputType: 'scenario_choice',
    text: "A group project needs finalizing. Which task appeals most?",
    options: [
      { id: '2a', text: 'Writing the final report and ensuring accuracy', theme: 'C' },
      { id: '2b', text: 'Creating the visual presentation (slides/video)', theme: 'A' },
      { id: '2c', text: 'Presenting the project findings to the class', theme: 'E' },
      { id: '2d', text: 'Analyzing the data collected during the project', theme: 'I' },
      { id: '2e', text: 'Building a physical model or prototype related to the project', theme: 'R' },
      { id: '2f', text: 'Mediating disagreements within the group', theme: 'S' },
    ]
  },
   {
    id: 'interest_scenario_3', sectionId: 'interests', inputType: 'scenario_choice',
    text: "Which after-school club sounds most interesting?",
    options: [
      { id: '3a', text: 'Robotics club (building things)', theme: 'R' },
      { id: '3b', text: 'Debate club (persuading others)', theme: 'E' },
      { id: '3c', text: 'Art club (creating visuals)', theme: 'A' },
      { id: '3d', text: 'Science Olympiad (investigating problems)', theme: 'I' },
      { id: '3e', text: 'Tutoring club (helping others learn)', theme: 'S' },
      { id: '3f', text: 'Yearbook club (organizing layouts and details)', theme: 'C' },
    ]
  },
    {
    id: 'interest_scenario_4', sectionId: 'interests', inputType: 'scenario_choice',
    text: "You find a complex gadget you've never seen before. What's your first instinct?",
    options: [
      { id: '4a', text: 'Take it apart to see how it works', theme: 'R' },
      { id: '4b', text: 'Research what it is and how it\'s used', theme: 'I' },
      { id: '4c', text: 'Imagine cool ways to redesign its look', theme: 'A' },
      { id: '4d', text: 'Ask friends if they know what it is', theme: 'S' },
      { id: '4e', text: 'Think about how you could sell it', theme: 'E' },
      { id: '4f', text: 'Carefully catalogue its features and buttons', theme: 'C' },
    ]
  },
   {
    id: 'interest_scenario_5', sectionId: 'interests', inputType: 'scenario_choice',
    text: "Which part of creating a new mobile app would you enjoy most?",
    options: [
      { id: '5a', text: 'Coding the app\'s features', theme: 'I' }, // Could be R/I
      { id: '5b', text: 'Designing the user interface and icons', theme: 'A' },
      { id: '5c', text: 'Leading the development team', theme: 'E' },
      { id: '5d', text: 'Helping users troubleshoot problems', theme: 'S' },
      { id: '5e', text: 'Carefully testing the app for bugs', theme: 'C' },
      { id: '5f', text: 'Building the hardware it runs on', theme: 'R' },
    ]
  },
];

// --- Personality Questions (Big Five - Simplified) ---
export const personalityQuestions: LikertQuestion[] = [
    // Openness
    { id: 'pers_openness_ideas', sectionId: 'personality', inputType: 'likert', scaleType: 'personality_agreement', text: 'I have a vivid imagination and enjoy exploring new ideas.' },
    { id: 'pers_openness_art', sectionId: 'personality', inputType: 'likert', scaleType: 'personality_agreement', text: 'I appreciate art, beauty, and creative expression.' },
    // Conscientiousness
    { id: 'pers_consc_organized', sectionId: 'personality', inputType: 'likert', scaleType: 'personality_agreement', text: 'I like to keep things organized and follow a plan.' },
    { id: 'pers_consc_reliable', sectionId: 'personality', inputType: 'likert', scaleType: 'personality_agreement', text: 'I am reliable and always finish tasks I start.' },
    // Extraversion
    { id: 'pers_extra_talkative', sectionId: 'personality', inputType: 'likert', scaleType: 'personality_agreement', text: 'I am talkative and enjoy being around people.' },
    { id: 'pers_extra_energy', sectionId: 'personality', inputType: 'likert', scaleType: 'personality_agreement', text: 'I have a lot of energy and enthusiasm.' },
    // Agreeableness
    { id: 'pers_agree_helpful', sectionId: 'personality', inputType: 'likert', scaleType: 'personality_agreement', text: 'I am considerate and helpful towards others.' },
    { id: 'pers_agree_trusting', sectionId: 'personality', inputType: 'likert', scaleType: 'personality_agreement', text: 'I generally trust people and believe in the good of others.' },
    // Neuroticism (Emotional Stability - framed positively where possible)
    { id: 'pers_neuro_calm', sectionId: 'personality', inputType: 'likert', scaleType: 'personality_agreement', text: 'I remain calm in stressful situations.' }, // Positively framed
    { id: 'pers_neuro_worry', sectionId: 'personality', inputType: 'likert', scaleType: 'personality_agreement', text: 'I tend to worry about things.' }, // Negatively framed (necessary for construct)
];

// --- Aptitude Questions ---
export const aptitudeQuestions: AptitudeQuestion[] = [
    // Verbal Reasoning
    {
        id: 'apt_verbal_analogy', sectionId: 'aptitude', inputType: 'multiple_choice',
        text: "Which word completes the analogy? Tree is to Forest as Soldier is to ______",
        options: [ { id: 'a', text: 'Gun' }, { id: 'b', text: 'Army' }, { id: 'c', text: 'Battle' }, { id: 'd', text: 'Uniform' } ],
        correctAnswerId: 'b'
    },
    {
        id: 'apt_verbal_meaning', sectionId: 'aptitude', inputType: 'multiple_choice',
        text: "Which word is closest in meaning to 'Diligent'?",
        options: [ { id: 'a', text: 'Lazy' }, { id: 'b', text: 'Intelligent' }, { id: 'c', text: 'Hardworking' }, { id: 'd', text: 'Careless' } ],
        correctAnswerId: 'c'
    },
    // Numerical Reasoning
    {
        id: 'apt_numerical_series', sectionId: 'aptitude', inputType: 'multiple_choice',
        text: "What number comes next in the series? 2, 4, 8, 16, ___",
        options: [ { id: 'a', text: '20' }, { id: 'b', text: '24' }, { id: 'c', text: '32' }, { id: 'd', text: '64' } ],
        correctAnswerId: 'c'
    },
     { // Re-using the bat/ball logic puzzle as a numerical reasoning item
        id: 'apt_numerical_logic', sectionId: 'aptitude', inputType: 'multiple_choice',
        text: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
        options: [ { id: 'a', text: '$0.05' }, { id: 'b', text: '$0.10' }, { id: 'c', text: '$1.00' }, { id: 'd', text: '$0.15' } ],
        correctAnswerId: 'a' // Ball = 5 cents, Bat = $1.05
    },
    // Abstract Reasoning
    {
        id: 'apt_abstract_pattern', sectionId: 'aptitude', inputType: 'multiple_choice',
        text: "Which shape logically completes the pattern? (Imagine a sequence: Square, Circle, Triangle, Square, Circle, ___)",
        options: [ { id: 'a', text: 'Square' }, { id: 'b', text: 'Circle' }, { id: 'c', text: 'Triangle' }, { id: 'd', text: 'Star' } ],
        correctAnswerId: 'c'
    },
    {
        id: 'apt_abstract_odd_one_out', sectionId: 'aptitude', inputType: 'multiple_choice',
        text: "Which figure is the odd one out? (Imagine: 3 squares and 1 circle)",
        options: [ { id: 'a', text: 'Square 1' }, { id: 'b', text: 'Square 2' }, { id: 'c', text: 'Circle' }, { id: 'd', text: 'Square 3' } ],
        correctAnswerId: 'c'
    },
];

// --- Learning Style Questions (VARK - Simplified) ---
export const learningStyleQuestions: LearningStyleQuestion[] = [
    {
        id: 'learn_style_info', sectionId: 'learning_style', inputType: 'multiple_choice',
        text: "When learning something new, I prefer to:",
        options: [
            { id: 'ls1_v', text: 'Look at diagrams, charts, and pictures.', learningStyle: 'V' },
            { id: 'ls1_a', text: 'Listen to someone explain it or discuss it.', learningStyle: 'A' },
            { id: 'ls1_r', text: 'Read about it in detail.', learningStyle: 'R' },
            { id: 'ls1_k', text: 'Try it out myself, hands-on.', learningStyle: 'K' },
        ]
    },
    {
        id: 'learn_style_remember', sectionId: 'learning_style', inputType: 'multiple_choice',
        text: "I remember things best when I:",
        options: [
            { id: 'ls2_v', text: 'Visualize them in my mind.', learningStyle: 'V' },
            { id: 'ls2_a', text: 'Hear them spoken.', learningStyle: 'A' },
            { id: 'ls2_r', text: 'Write them down or read notes.', learningStyle: 'R' },
            { id: 'ls2_k', text: 'Physically do or practice them.', learningStyle: 'K' },
        ]
    },
    {
        id: 'learn_style_instructions', sectionId: 'learning_style', inputType: 'multiple_choice',
        text: "When following instructions, I prefer:",
        options: [
            { id: 'ls3_v', text: 'Watching a demonstration or seeing pictures.', learningStyle: 'V' },
            { id: 'ls3_a', text: 'Listening to verbal instructions.', learningStyle: 'A' },
            { id: 'ls3_r', text: 'Reading written instructions.', learningStyle: 'R' },
            { id: 'ls3_k', text: 'Jumping in and figuring it out as I go.', learningStyle: 'K' },
        ]
    },
];


export const skillQuestions: (MiniChallengeQuestion | ScenarioChoiceQuestion | LikertQuestion)[] = [
    // Removed logic puzzle as it's now in Aptitude
    {
        id: 'skill_challenge_creative', sectionId: 'skills', inputType: 'mini_challenge_textarea',
        text: "Challenge: Quickly list 3 unusual uses for a paperclip.",
        // Set followUpQuestion sectionId to 'skills'
        followUpQuestion: { id: 'skill_challenge_creative_enjoyment', sectionId: 'skills', inputType: 'likert', scaleType: 'skill_enjoyment', text: "How much did you enjoy brainstorming creative ideas like that?" }
    },
    {
        id: 'skill_scenario_presentation', sectionId: 'skills', inputType: 'scenario_choice',
        text: "You need to present a project. Which part are you most comfortable handling?",
        options: [
          { id: 'research', text: 'Researching the topic deeply' },
          { id: 'slides', text: 'Creating the visual slides' },
          { id: 'presenting', text: 'Delivering the oral presentation' },
          { id: 'organizing', text: 'Organizing the team\'s workflow' },
        ]
    },
    { id: 'skill_rating_technical', sectionId: 'skills', inputType: 'likert', scaleType: 'skill_confidence', text: 'How confident are you in your ability to use technical software or tools?' },
    { id: 'skill_rating_detail', sectionId: 'skills', inputType: 'likert', scaleType: 'skill_confidence', text: 'How confident are you in your ability to pay close attention to details?' },
    { id: 'skill_rating_teamwork', sectionId: 'skills', inputType: 'likert', scaleType: 'skill_confidence', text: 'How confident are you in your ability to work effectively as part of a team?' },
];

export const valueRatingQuestions: LikertQuestion[] = [
   { id: 'value_rating_achievement', sectionId: 'values', inputType: 'likert', scaleType: 'value_importance', text: 'Achievement: Feeling of accomplishment' },
   { id: 'value_rating_independence', sectionId: 'values', inputType: 'likert', scaleType: 'value_importance', text: 'Independence: Ability to work on my own' },
   { id: 'value_rating_recognition', sectionId: 'values', inputType: 'likert', scaleType: 'value_importance', text: 'Recognition: Receiving credit for my work' },
   { id: 'value_rating_relationships', sectionId: 'values', inputType: 'likert', scaleType: 'value_importance', text: 'Relationships: Positive connections with coworkers' },
   { id: 'value_rating_support', sectionId: 'values', inputType: 'likert', scaleType: 'value_importance', text: 'Support: Having supportive management' },
   { id: 'value_rating_working_conditions', sectionId: 'values', inputType: 'likert', scaleType: 'value_importance', text: 'Working Conditions: Comfortable physical environment' },
   { id: 'value_rating_variety', sectionId: 'values', inputType: 'likert', scaleType: 'value_importance', text: 'Variety: Opportunity to do different things' },
   { id: 'value_rating_security', sectionId: 'values', inputType: 'likert', scaleType: 'value_importance', text: 'Security: Stable and secure job' },
   { id: 'value_rating_helping_others', sectionId: 'values', inputType: 'likert', scaleType: 'value_importance', text: 'Helping Others: Contributing to the well-being of others' },
   { id: 'value_rating_creativity', sectionId: 'values', inputType: 'likert', scaleType: 'value_importance', text: 'Creativity: Opportunity to use my own ideas' },
];

export const valueRankingQuestion: ValueRankingQuestion = {
    id: 'value_ranking_top3', sectionId: 'values', inputType: 'value_ranking',
    text: "From the values you rated as 'Important' (4) or 'Very Important' (5), please select your Top 3 most crucial work values.",
    dependsOnRatings: true
};

export const goalQuestions: TextareaQuestion[] = [
  { id: 'goals_subjects', sectionId: 'goals', inputType: 'textarea', text: "What subjects or activities in school do you enjoy the most right now, and why?" },
  { id: 'goals_problems', sectionId: 'goals', inputType: 'textarea', text: "Are there any real-world problems or causes you feel passionate about or would like to help solve?" },
  { id: 'goals_future', sectionId: 'goals', inputType: 'textarea', text: "Imagine yourself 5 years after finishing your current schooling. What's one thing you hope you are doing or achieving?" },
];

// Combine all questions in order, flattening mini-challenges
export const allQuestions: AssessmentQuestion[] = [
  ...warmupQuestions,
  ...interestScenarios,
  ...personalityQuestions, // Added Personality
  ...aptitudeQuestions, // Added Aptitude
  // Correctly flatten skill challenges + follow-ups (if any remain)
  ...skillQuestions.flatMap(q => {
      if ('followUpQuestion' in q && q.followUpQuestion) {
          return [q, q.followUpQuestion];
      }
      return [q];
  }),
  ...valueRatingQuestions,
  valueRankingQuestion, // Keep ranking after ratings
  ...learningStyleQuestions, // Added Learning Style
  ...goalQuestions, // Goals at the end
];

// --- Define Scales ---
export const scales = {
    skill_confidence: [ { value: 1, label: 'Not Confident' }, { value: 2, label: 'Slightly Confident' }, { value: 3, label: 'Moderately Confident' }, { value: 4, label: 'Confident' }, { value: 5, label: 'Very Confident' }],
    value_importance: [ { value: 1, label: 'Not Important' }, { value: 2, label: 'Slightly Important' }, { value: 3, label: 'Moderately Important' }, { value: 4, label: 'Important' }, { value: 5, label: 'Very Important' }],
    skill_enjoyment: [ { value: 1, label: 'Strongly Dislike' }, { value: 2, label: 'Dislike' }, { value: 3, label: 'Neutral' }, { value: 4, label: 'Like' }, { value: 5, label: 'Strongly Like' }],
    // Added Personality Agreement Scale
    personality_agreement: [ { value: 1, label: 'Strongly Disagree' }, { value: 2, label: 'Disagree' }, { value: 3, label: 'Neutral' }, { value: 4, label: 'Agree' }, { value: 5, label: 'Strongly Agree' }]
};

// --- Section Introductions ---
// Use Partial to avoid needing entries for ALL SectionIds if some don't have intros
export const sectionIntros: Partial<Record<SectionId, string>> = {
    warmup: "Let's start with a couple of quick, fun questions to get warmed up!",
    interests: "Now, let's explore what kinds of activities and scenarios you find most interesting (RIASEC). This helps us understand your natural inclinations.",
    personality: "This section asks about your typical ways of thinking, feeling, and behaving (Big Five). There are no right or wrong answers.",
    aptitude: "Next up are some short challenges designed to gauge different thinking skills. Try your best!",
    skills: "This section focuses on your confidence in various practical skills and how much you enjoy certain types of tasks.",
    // Removed skills_enjoyment intro
    values: "Work values are important for job satisfaction. Please rate how important each value is to you, then select your top 3.",
    learning_style: "How do you prefer to learn new things? Choose the option that best describes you.",
    goals: "Finally, let's think about your future aspirations and what motivates you."
};

// --- Sample Work Value Items (Needed for Value Ranking Logic) ---
// This is duplicated from the component but needed here if we move ranking logic later
// For now, keep it here to ensure the types are self-contained.
export const valueItems = [
   { id: 'value_achievement', text: 'Achievement: Feeling of accomplishment' },
  { id: 'value_independence', text: 'Independence: Ability to work on my own' },
  { id: 'value_recognition', text: 'Recognition: Receiving credit for my work' },
  { id: 'value_relationships', text: 'Relationships: Positive connections with coworkers' },
  { id: 'value_support', text: 'Support: Having supportive management' },
  { id: 'value_working_conditions', text: 'Working Conditions: Comfortable physical environment' },
  { id: 'value_variety', text: 'Variety: Opportunity to do different things' },
  { id: 'value_security', text: 'Security: Stable and secure job' },
  { id: 'value_helping_others', text: 'Helping Others: Contributing to the well-being of others' },
  { id: 'value_creativity', text: 'Creativity: Opportunity to use my own ideas' },
];
