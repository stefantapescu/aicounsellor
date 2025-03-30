'use client'

import React, { useState, useTransition } from 'react'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateAndSaveAssessmentAnalysis } from '@/app/assessment/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { valueItems } from '@/app/assessment/assessmentData';

interface ReportData {
  text: string;
  success: boolean;
    updatedAt: string;
}

// Define the expected shape of the saved analysis result from the action
interface SavedVocationalResult {
    user_id: string;
    assessment_id: string;
    riasec_scores?: Record<string, unknown> | null; // Keep unknown for flexibility if parsing isn't done here
    strengths_analysis?: string | null;
    areas_for_development?: string | null;
    potential_contradictions?: string | null;
    full_ai_analysis: { raw_response: string; generated_at: string; success: boolean; };
    narrative_story: string; // Ensure this is included
    updated_at: string;
    id?: number; // Optional ID if selected
    created_at?: string; // Optional timestamp if selected
}


interface AssessmentProfile {
  riasec_scores: Record<string, number> | null;
  personality_scores: Record<string, number> | null;
  aptitude_scores: { verbalCorrect: number, numericalCorrect: number, abstractCorrect: number, totalCorrect: number, totalAttempted: number } | null;
  work_values: { ranked: string[] } | null;
  learning_style: string | null;
}

interface FullAIAnalysis {
    raw_response?: string | null;
    generated_at?: string;
    success?: boolean;
}

interface ResultsClientSectionProps {
  userId: string;
  initialReport: ReportData | null;
  initialStory: string | null;
  profileScores: AssessmentProfile | null;
}

// --- Chart Components ---

const RiasecChart = ({ data }: { data: Record<string, number> | null }) => {
  if (!data) return <div className="text-center text-sm text-gray-500">RIASEC data not available.</div>;
  const chartData = [ { subject: 'Realistic', A: data.R || 0, fullMark: 5 }, { subject: 'Investigative', A: data.I || 0, fullMark: 5 }, { subject: 'Artistic', A: data.A || 0, fullMark: 5 }, { subject: 'Social', A: data.S || 0, fullMark: 5 }, { subject: 'Enterprising', A: data.E || 0, fullMark: 5 }, { subject: 'Conventional', A: data.C || 0, fullMark: 5 }, ];
  const allZero = chartData.every(item => item.A === 0);
  if (allZero) return <div className="text-center text-sm text-gray-500">RIASEC scores not calculated yet.</div>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13 }} />
        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }}/>
        <Radar name="Score" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        <Tooltip contentStyle={{ fontSize: '12px', padding: '5px' }} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

const PersonalityChart = ({ data }: { data: Record<string, number> | null }) => {
   if (!data) return <div className="text-center text-sm text-gray-500">Personality data not available.</div>;
   const chartData = [ { subject: 'Openness', A: data.O || 0, fullMark: 10 }, { subject: 'Consc.', A: data.C || 0, fullMark: 10 }, { subject: 'Extraver.', A: data.E || 0, fullMark: 10 }, { subject: 'Agreeable.', A: data.A || 0, fullMark: 10 }, { subject: 'Neuroticism (Inv)', A: data.N || 0, fullMark: 10 }, ];
    const allZero = chartData.every(item => item.A === 0);
    if (allZero) return <div className="text-center text-sm text-gray-500">Personality scores not calculated yet.</div>;
   return (
     <ResponsiveContainer width="100%" height={300}>
       <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
         <PolarGrid />
         <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13 }} />
         <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10 }}/>
         <Radar name="Score" dataKey="A" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
         <Tooltip contentStyle={{ fontSize: '12px', padding: '5px' }} />
       </RadarChart>
     </ResponsiveContainer>
   );
};

const AptitudeChart = ({ data }: { data: AssessmentProfile['aptitude_scores'] | null }) => {
  if (!data) return <div className="text-center text-sm text-gray-500">Aptitude data not available.</div>;
  if (data.totalAttempted === 0) return <div className="text-center text-sm text-gray-500">No aptitude questions attempted.</div>;
  const chartData = [ { name: 'Verbal', score: data.verbalCorrect || 0 }, { name: 'Numerical', score: data.numericalCorrect || 0 }, { name: 'Abstract', score: data.abstractCorrect || 0 }, ];
  const maxScorePerCategory = 2;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }}/>
        <YAxis domain={[0, maxScorePerCategory]} allowDecimals={false} tick={{ fontSize: 10 }}/>
        <Tooltip contentStyle={{ fontSize: '12px', padding: '5px' }} />
        <Legend wrapperStyle={{ fontSize: '12px' }}/>
        <Bar dataKey="score" fill="#8884d8" name="Correct Answers" />
      </BarChart>
    </ResponsiveContainer>
  );
};


export default function ResultsClientSection({ userId, initialReport, initialStory, profileScores }: ResultsClientSectionProps) {
  const [report, setReport] = useState<ReportData | null>(initialReport);
  const [story, setStory] = useState<string | null>(initialStory);
  // Scores are passed as props and not expected to change client-side without re-fetching page
  const [scores] = useState<AssessmentProfile | null>(profileScores);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleReanalyze = () => {
    setError(null);
    setStatusMessage("Requesting new analysis...");
    startTransition(async () => {
      const analysisResult = await generateAndSaveAssessmentAnalysis(userId);
      if (!analysisResult.success || analysisResult.error) {
        setError(`Failed to generate new analysis: ${analysisResult.error}`);
        setStatusMessage(null);
        setReport(prev => prev ? { ...prev, success: false } : null);
      } else {
        // Explicitly type newAnalysisData
        const newAnalysisData: FullAIAnalysis | null | undefined = analysisResult.analysis?.full_ai_analysis;
        const newReportText = newAnalysisData?.raw_response ?? 'Analysis generated, but content is missing.';
        const newSuccess = newAnalysisData?.success ?? false;
        // Safely access narrative_story using the defined type
        const savedAnalysis = analysisResult.analysis as SavedVocationalResult | null; // Use the specific type
        const newStoryText = savedAnalysis?.narrative_story ?? 'Personalized story generation failed.';

        setReport({
          text: newReportText,
          success: newSuccess,
          updatedAt: analysisResult.analysis?.updated_at ?? new Date().toISOString(),
        });
        setStory(newStoryText);
        setStatusMessage("New analysis generated successfully!");
      }
    });
  };

  // --- Render Logic ---

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const analysisErrorParam = urlParams?.get('error');
  if (analysisErrorParam === 'analysis_failed' && !initialReport && !initialStory) {
      return (
          <div className="mt-6 text-center">
              <p className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">There was an error generating your report after completing the assessment. You can try again below.</p>
              <Button onClick={handleReanalyze} disabled={isPending} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
                  {isPending ? 'Analyzing...' : 'Try Generating Report Again'}
              </Button>
              {error && <p className="mt-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">{error}</p>}
              {statusMessage && <p className="mt-4 text-sm text-blue-700">{statusMessage}</p>}
          </div>
      );
  }

  if (!report && !scores && !story) {
      return <p className="mt-6 text-center text-gray-500">No assessment results found. Please complete the assessment first.</p>;
  }

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader><CardTitle>Your Profile at a Glance</CardTitle></CardHeader>
            <CardContent className="space-y-8">
                <div>
                    <h3 className="mb-1 text-center text-lg font-semibold">Interests (RIASEC)</h3>
                    <p className="mb-3 text-center text-xs text-gray-500 dark:text-gray-400">Shows alignment with 6 broad career interest areas.</p>
                    <RiasecChart data={scores?.riasec_scores ?? null} />
                </div>
                <div>
                    <h3 className="mb-1 text-center text-lg font-semibold">Personality (Big Five)</h3>
                     <p className="mb-3 text-center text-xs text-gray-500 dark:text-gray-400">Reflects key personality traits relevant to work environments.</p>
                    <PersonalityChart data={scores?.personality_scores ?? null} />
                </div>
                <div>
                    <h3 className="mb-1 text-center text-lg font-semibold">Aptitude</h3>
                    <p className="mb-3 text-center text-xs text-gray-500 dark:text-gray-400">Indicates performance on reasoning challenges.</p>
                    <AptitudeChart data={scores?.aptitude_scores ?? null} />
                </div>
                <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-2">
                     <div className="min-h-[150px] rounded border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                         <h3 className="mb-2 text-lg font-semibold">Top Work Values:</h3>
                         <ul className="list-disc space-y-1.5 pl-5 text-sm md:text-base">
                             {(scores?.work_values?.ranked || []).map((valueId) => {
                                 const item = valueItems.find(v => v.id === valueId);
                                 const text = item?.text.split(': ')[1] || valueId;
                                 return <li key={valueId}>{text}</li>;
                             })}
                             {(!scores?.work_values?.ranked || scores.work_values.ranked.length === 0) && <li className="italic text-gray-500">Not determined</li>}
                         </ul>
                     </div>
                     <div className="min-h-[150px] rounded border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                         <h3 className="mb-2 text-lg font-semibold">Preferred Learning Style:</h3>
                         <p className="text-sm md:text-base">{scores?.learning_style || <span className="italic text-gray-500">Not determined</span>}</p>
                     </div>
                </div>
            </CardContent>
        </Card>

        {story && (
          <Card>
              <CardHeader><CardTitle>Connecting Your Dots: Your Story</CardTitle></CardHeader>
              <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert sm:prose lg:prose-lg xl:prose-xl">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>{story}</ReactMarkdown>
                  </div>
              </CardContent>
          </Card>
        )}

      {report && (
          <Card>
              <CardHeader><CardTitle>Detailed Analysis & Suggestions</CardTitle></CardHeader>
              <CardContent>
                  {!report.success && (
                       <p className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                         The previous attempt to generate the structured report encountered an error. Details might be included below, or you can try re-analyzing.
                       </p>
                  )}
                  <div className="prose prose-sm max-w-none dark:prose-invert sm:prose lg:prose-lg xl:prose-xl">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.text}</ReactMarkdown>
                  </div>
                   <p className="pt-4 text-right text-xs text-gray-500">
                      Report generated: {new Date(report.updatedAt).toLocaleString()}
                   </p>
              </CardContent>
          </Card>
      )}

      <div className="mt-8 text-center">
         <Button
           onClick={handleReanalyze}
           disabled={isPending}
           className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
         >
           {isPending ? 'Analyzing...' : 'Re-generate Report'}
         </Button>
         {statusMessage && !error && (
            <p className="mt-4 text-sm text-blue-700">{statusMessage}</p>
         )}
         {error && (
           <p className="mt-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">
             {error}
           </p>
         )}
      </div>
    </div>
  );
}
