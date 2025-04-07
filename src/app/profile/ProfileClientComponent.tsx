'use client';

import React from 'react';
import { type AssessmentQuestion, type ChoiceOption, scales, valueItems, type WarmupChoiceQuestion, type ScenarioChoiceQuestion, type AptitudeQuestion, type LearningStyleQuestion, type LikertQuestion } from '@/app/assessment/assessmentData';
import { Label } from '@/components/ui/label';
import { type VocationalProfile, type DreamscapesAnalysis } from '@/types/profile'; // Import types
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

interface ProfileClientComponentProps {
  userAnswers: Record<string, { questionText: string; answer: string | number | string[] }>;
  allQuestionsMap: Map<string, AssessmentQuestion>;
  vocationalProfile: VocationalProfile | null;
  // TODO: Pass fetched careers corresponding to suggested_onet_codes
}

// Helper component to display sections
const ProfileSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = "" }) => (
  <div className={`rounded border p-4 dark:border-gray-700 ${className}`}>
    <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white">
      {title}
    </h2>
    {children}
  </div>
);

// Helper to display key-value pairs or lists with badges
const InfoItem: React.FC<{ label: string; value?: string | string[] | null }> = ({ label, value }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return (
       <div className="mb-2">
         <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}:</p>
         <p className="text-sm text-gray-500 dark:text-gray-400 italic">N/A</p>
       </div>
    );
  }
  return (
    <div className="mb-2">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}:</p>
      {Array.isArray(value) ? (
        <div className="flex flex-wrap gap-1 mt-1">
          {value.map((item, index) => <Badge key={index} variant="secondary">{item}</Badge>)}
        </div>
      ) : (
        <p className="text-sm text-gray-800 dark:text-gray-200">{value}</p>
      )}
    </div>
  );
};


export default function ProfileClientComponent({
  userAnswers,
  allQuestionsMap,
  vocationalProfile,
}: ProfileClientComponentProps) {

  // Define a type guard for assessment questions with options
  type QuestionWithOptions = WarmupChoiceQuestion | ScenarioChoiceQuestion | AptitudeQuestion | LearningStyleQuestion;
  const hasOptions = (q: AssessmentQuestion): q is QuestionWithOptions => 'options' in q;

  // --- Safely parse JSONB data ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assessmentSummary: any = React.useMemo(() => { // Keep any for now
    if (!vocationalProfile?.assessment_summary) return null;
    try {
      // Ensure it's treated as an object, even if parsing fails later
      return typeof vocationalProfile.assessment_summary === 'object'
        ? vocationalProfile.assessment_summary
        : JSON.parse(vocationalProfile.assessment_summary as string); // Assume string if not object
    } catch (e) { console.error("Error parsing assessment_summary", e); return null; }
  }, [vocationalProfile?.assessment_summary]);

  // Use the specific type for dreamscapes analysis
  const dreamscapesAnalysis: DreamscapesAnalysis | null = React.useMemo(() => {
     if (!vocationalProfile?.dreamscapes_analysis) return null;
     try {
       // Assuming dreamscapes_analysis is already an object or null based on type
       return vocationalProfile.dreamscapes_analysis;
    } catch (e) { console.error("Error parsing dreamscapes_analysis", e); return null; }
  }, [vocationalProfile?.dreamscapes_analysis]);
  // --- End Safe Parsing ---

  return (
    <div className="space-y-8">

      {/* --- Vocational Profile Summary Section --- */}
      <ProfileSection title="Vocational Profile Summary" className="bg-blue-50 border-blue-200 dark:bg-gray-800 dark:border-blue-700">
        {vocationalProfile ? (
          <>
            {vocationalProfile.combined_profile_summary ? (
              <p className="mb-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{vocationalProfile.combined_profile_summary}</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">AI summary not generated yet.</p>
            )}

            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4 border-t border-blue-200 pt-4 dark:border-blue-700">
              {/* Column 1: Assessment Insights */}
              <div>
                 <h3 className="text-md font-semibold mb-2 text-blue-700 dark:text-blue-400">Assessment Insights</h3>
                 <InfoItem label="Holland Codes (Top 3)" value={assessmentSummary?.holland_codes?.slice(0, 3)} />
                 <InfoItem label="Top Work Values" value={assessmentSummary?.work_values?.slice(0, 3)} />
                 {/* TODO: Add Skills/Aptitudes display here when data structure is known */}
                 {/* <InfoItem label="Key Skills" value={assessmentSummary?.skills?.slice(0, 5)} /> */}
              </div>
               {/* Column 2: Dreamscapes Insights */}
               {dreamscapesAnalysis ? (
                 <div>
                    <h3 className="text-md font-semibold mb-2 text-blue-700 dark:text-blue-400">Dreamscapes Themes</h3>
                    <InfoItem label="Themes" value={dreamscapesAnalysis.themes} />
                    <InfoItem label="Values" value={dreamscapesAnalysis.values} />
                    <InfoItem label="Interests" value={dreamscapesAnalysis.interests} />
                    <InfoItem label="Motivators" value={dreamscapesAnalysis.motivators} />
                 </div>
               ) : (
                 <div>
                    <h3 className="text-md font-semibold mb-2 text-blue-700 dark:text-blue-400">Dreamscapes Themes</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">Not available.</p>
                 </div>
               )}
            </div>
             {/* Render date only on client to avoid hydration mismatch */}
             <ClientOnlyDate dateString={vocationalProfile.last_updated} />
          </>
        ) : (
           <p className="text-gray-500 dark:text-gray-400">Vocational profile data is not yet available. Complete the assessment to generate insights.</p>
        )}
      </ProfileSection>
      {/* --- End Vocational Profile Summary Section --- */}


      {/* --- Suggested Careers Section --- */}
      <ProfileSection title="Suggested Career Paths">
         {vocationalProfile?.suggested_onet_codes && vocationalProfile.suggested_onet_codes.length > 0 ? (
           <div>
             <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Based on your profile, consider exploring:</p>
             {/* TODO: Fetch career names/descriptions and render cards */}
             <ul className="list-disc list-inside space-y-1">
               {vocationalProfile.suggested_onet_codes.map(code => (
                 <li key={code}>
                   <Link href={`/career-explorer/${code}`} className="text-blue-600 hover:underline dark:text-blue-400">
                     {code} {/* Replace with career name when available */}
                   </Link>
                 </li>
               ))}
             </ul>
             <Link href="/career-explorer" className="mt-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400">
                View all matches &rarr;
             </Link>
           </div>
         ) : (
           <p className="text-gray-500 dark:text-gray-400 italic">No specific career suggestions generated yet.</p>
         )}
      </ProfileSection>
      {/* --- End Suggested Careers Section --- */}


       {/* --- Detailed Assessment Answers Section --- */}
       <ProfileSection title="Detailed Assessment Answers">
        {Object.keys(userAnswers).length > 0 ? (
            Array.from(allQuestionsMap.values()).map((question) => {
              const answerData = userAnswers[question.id];
              const answer = answerData?.answer;
              let formattedAnswer: string | React.JSX.Element = <span className="italic text-gray-500 dark:text-gray-400">Not Answered</span>;

              if (answer !== undefined && answer !== null) {
                  // Group all multiple choice types together
                  switch (question.inputType) {
                      case 'multiple_choice':
                      case 'scenario_choice':
                      // @ts-expect-error - Workaround for persistent type comparison error
                      case 'aptitude':
                      // @ts-expect-error - Workaround for persistent type comparison error
                      case 'learning_style':
                        if (hasOptions(question)) {
                          const chosenOption = question.options.find((opt: ChoiceOption) => opt.id === answer);
                          formattedAnswer = chosenOption ? chosenOption.text : `Unknown Option (${answer})`;
                        } else {
                          formattedAnswer = `Error: Options missing`;
                        }
                        break;
                      case 'likert':
                        const likertQuestion = question as LikertQuestion;
                        const scale = scales[likertQuestion.scaleType];
                        const scaleOption = scale?.find(opt => opt.value === Number(answer));
                        formattedAnswer = scaleOption ? `${scaleOption.label} (${answer})` : `Invalid Value (${answer})`;
                        break;
                      case 'mini_challenge_text':
                      case 'textarea':
                        formattedAnswer = String(answer);
                        break;
                      case 'mini_challenge_textarea':
                         const text = String(answer);
                         formattedAnswer = text.length > 100 ? text.substring(0, 100) + '...' : text;
                         break;
                      case 'value_ranking':
                        if (Array.isArray(answer)) {
                          const valueMap = new Map(valueItems.map(item => [item.id, item.text]));
                          formattedAnswer = (
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                              {answer.map((valueId: string) => {
                                const fullText = valueMap.get(valueId) || valueId;
                                const valueText = fullText.includes(': ') ? fullText.split(': ')[1] : fullText;
                                return <li key={valueId}>{valueText}</li>;
                              })}
                            </ol>
                          );
                        } else {
                          formattedAnswer = JSON.stringify(answer);
                        }
                        break;
                      // No default case needed as AssessmentQuestion union should be exhaustive
                  }
              }

              return (
                <div key={question.id} className="mb-4 border-b pb-4 dark:border-gray-700 last:border-b-0 last:pb-0">
                  <Label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
                    {question.text}
                  </Label>
                  <div className="text-sm text-gray-800 dark:text-gray-100 mt-1">
                    {formattedAnswer}
                  </div>
                </div>
              );
            })
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">No assessment answers found.</p>
        )}
       </ProfileSection>
       {/* --- End Detailed Assessment Answers Section --- */}
    </div>
  );
}

// Helper component to render date only on the client
const ClientOnlyDate: React.FC<{ dateString: string }> = ({ dateString }) => {
  const [displayDate, setDisplayDate] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Format date only after component mounts on the client
    setDisplayDate(new Date(dateString).toLocaleString());
  }, [dateString]);

  return (
    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
      Last Updated: {displayDate || '...'} {/* Show placeholder or nothing while mounting */}
    </p>
  );
};
