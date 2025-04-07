import { z } from 'zod';

// Types for O*NET API responses
export const OnetResponseSchema = z.object({
  status: z.string(),
  data: z.any(),
  message: z.string().optional(),
});

export type OnetResponse = z.infer<typeof OnetResponseSchema>;

// Detailed types for O*NET data
export const OccupationSchema = z.object({
  code: z.string(),
  title: z.string(),
  description: z.string(),
  tasks: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
  })),
  skills: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    importance: z.number(),
    level: z.number(),
  })),
  knowledge: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    importance: z.number(),
    level: z.number(),
  })),
  abilities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    importance: z.number(),
    level: z.number(),
  })),
  work_context: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    importance: z.number(),
  })),
  work_values: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    importance: z.number(),
  })),
  interests: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    importance: z.number(),
  })),
  work_styles: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    importance: z.number(),
  })),
  wages: z.object({
    median: z.number(),
    range: z.object({
      low: z.number(),
      high: z.number(),
    }),
    currency: z.string(),
  }),
  outlook: z.object({
    growth_rate: z.number(),
    projected_jobs: z.number(),
    projected_annual_openings: z.number(),
  }),
});

export type Occupation = z.infer<typeof OccupationSchema>;

// Base URL for O*NET API
const ONET_API_BASE_URL = 'https://services-beta.onetcenter.org/ws/v2';

// Utility function to make API calls to O*NET
export async function fetchOnetData<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = process.env.ONET_API_KEY;
  
  if (!apiKey) {
    throw new Error('O*NET API key is not configured');
  }

  // Use the API key as both username and password for Basic Auth
  const authString = Buffer.from(`${apiKey}:${apiKey}`).toString('base64');
  const url = `${ONET_API_BASE_URL}${endpoint}`;
  
  console.log('Making request to:', url);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Basic ${authString}`,
      'Accept': 'application/json',
      'User-Agent': 'YouniChoice/1.0',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const responseText = await response.text();
    console.error('O*NET API Response:', responseText);
    console.error('Response status:', response.status);
    console.error('Response headers:', response.headers);
    throw new Error(`O*NET API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

// Core API functions
export async function getOnetAbout() {
  return fetchOnetData('/info');
}

export async function getOnetOccupation(occupationCode: string): Promise<Occupation> {
  return fetchOnetData(`/occupations/${occupationCode}`);
}

export async function searchOnetOccupations(query: string) {
  if (!query) {
    // If no query is provided, get all occupations
    return fetchOnetData('/occupations');
  }
  return fetchOnetData(`/occupations/search?q=${encodeURIComponent(query)}`);
}

// Additional API functions for career matching
export async function getOccupationsBySkills(skills: string[]) {
  return fetchOnetData(`/occupations/skills?codes=${encodeURIComponent(skills.join(','))}`);
}

export async function getOccupationsByInterests(interests: string[]) {
  return fetchOnetData(`/occupations/interests?codes=${encodeURIComponent(interests.join(','))}`);
}

export async function getOccupationsByWorkValues(values: string[]) {
  return fetchOnetData(`/occupations/values?codes=${encodeURIComponent(values.join(','))}`);
}

export async function getOccupationsByWorkContext(contexts: string[]) {
  return fetchOnetData(`/occupations/context?codes=${encodeURIComponent(contexts.join(','))}`);
}

// Helper function to get all relevant data for career matching
export async function getCareerMatchingData(occupationCode: string) {
  const occupation = await getOnetOccupation(occupationCode);
  
  // Fetch additional data in parallel
  const [skills, interests, values, context] = await Promise.all([
    getOccupationsBySkills(occupation.skills.map(s => s.id)),
    getOccupationsByInterests(occupation.interests.map(i => i.id)),
    getOccupationsByWorkValues(occupation.work_values.map(v => v.id)),
    getOccupationsByWorkContext(occupation.work_context.map(c => c.id)),
  ]);

  return {
    occupation,
    related_skills: skills,
    related_interests: interests,
    related_values: values,
    related_context: context,
  };
} 