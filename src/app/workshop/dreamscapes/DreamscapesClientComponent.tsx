'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import RoboYouniMascot from '@/components/RoboYouniMascot'; // Import mascot

interface DreamscapesClientComponentProps {
  userId: string;
}

interface WorkshopResponses {
  dreams: string[];
  subDreams: { [key: string]: { vision: string; why: string }[] };
  essayGod: string;
  essayMillion: string;
}

// Define estimated times per step in seconds for the 12-step flow
const stepDurations: { [key: number]: number } = {
   1: 0 * 60,  // Step 1: Introduction (No timer or short timer e.g., 30s)
   2: 2 * 60,  // Step 2: Identify Dream 1 (2 mins)
   3: 6 * 60,  // Step 3: Expand D1 (6 mins)
   4: 6 * 60,  // Step 4: Reflect D1 (6 mins)
   5: 2 * 60,  // Step 5: Identify Dream 2 (2 mins)
   6: 6 * 60,  // Step 6: Expand D2 (6 mins)
   7: 6 * 60,  // Step 7: Reflect D2 (6 mins)
   8: 2 * 60,  // Step 8: Identify Dream 3 (2 mins)
   9: 6 * 60,  // Step 9: Expand D3 (6 mins)
  10: 6 * 60,  // Step 10: Reflect D3 (6 mins)
  11: 5 * 60,  // Step 11: Essay 1 (5 mins)
  12: 5 * 60,  // Step 12: Essay 2 (5 mins)
};

const DreamscapesClientComponent: React.FC<DreamscapesClientComponentProps> = ({ userId }) => {
  const [currentStep, setCurrentStep] = useState(1); // Start at step 1 (Intro)
  const [responses, setResponses] = useState<WorkshopResponses>({
    dreams: ['', '', ''],
    subDreams: {},
    essayGod: '',
    essayMillion: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(stepDurations[1]);

  const totalSteps = 12; // Updated total steps
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Effect
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(stepDurations[currentStep] || 0); // Get duration for current step

    // Only start timer if duration is greater than 0
    if (stepDurations[currentStep] > 0 && !isComplete) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentStep, isComplete]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // --- Input Handlers (remain the same) ---
   const handleDreamChange = (index: number, value: string) => {
    const newDreams = [...responses.dreams];
    newDreams[index] = value;
    setResponses(prev => ({ ...prev, dreams: newDreams }));
  };
  const handleSubDreamVisionChange = (dreamIndex: number, subDreamIndex: number, value: string) => {
    const dreamKey = `dream_${dreamIndex}`;
    const currentSubDreams = responses.subDreams[dreamKey] || Array(3).fill({ vision: '', why: '' });
    const newSubDreams = [...currentSubDreams];
    newSubDreams[subDreamIndex] = { ...newSubDreams[subDreamIndex], vision: value };
    setResponses(prev => ({ ...prev, subDreams: { ...prev.subDreams, [dreamKey]: newSubDreams } }));
  };
  const handleSubDreamWhyChange = (dreamIndex: number, subDreamIndex: number, value: string) => {
    const dreamKey = `dream_${dreamIndex}`;
    const currentSubDreams = responses.subDreams[dreamKey] || Array(3).fill({ vision: '', why: '' });
    const newSubDreams = [...currentSubDreams];
    newSubDreams[subDreamIndex] = { ...newSubDreams[subDreamIndex], why: value };
    setResponses(prev => ({ ...prev, subDreams: { ...prev.subDreams, [dreamKey]: newSubDreams } }));
  };
  const handleEssayChange = (essayType: 'essayGod' | 'essayMillion', value: string) => {
     setResponses(prev => ({ ...prev, [essayType]: value }));
   };

  // --- Step Rendering Helpers (adjusted step numbers) ---

  const renderIntroductionStep = () => {
    return (
        <div className="flex flex-col items-center text-center space-y-4">
             <RoboYouniMascot width={120} height={120} />
             <h3 className="text-xl font-semibold">Welcome to the Dreamscapes Workshop!</h3>
             <p className="text-muted-foreground max-w-md">
                 Hi there! I'm Youni. Let's embark on a journey of self-discovery together. In this workshop, we'll explore your aspirations through 11 creative steps:
             </p>
             <ul className="list-disc list-inside text-left text-sm text-muted-foreground max-w-md">
                 <li>Identify 3 of your biggest dreams.</li>
                 <li>Expand each dream into 3 specific 10-year visions.</li>
                 <li>Reflect on *why* these visions matter to you.</li>
                 <li>Engage in 2 short, creative writing exercises.</li>
             </ul>
             <p className="text-muted-foreground max-w-md">
                 The goal is to gain clarity on your motivations and build a foundation for your vocational profile. Ready to start dreaming?
             </p>
        </div>
    );
  };

  const renderDreamInputStep = (dreamIndex: number) => {
    const stepNumber = dreamIndex * 3 + 2; // Steps 2, 5, 8
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Step {stepNumber}: Identify Dream {dreamIndex + 1}</h3>
        <p className="text-sm text-muted-foreground">
          Write down your {dreamIndex === 0 ? 'first' : dreamIndex === 1 ? 'second' : 'third'} major dream. Focus on a broad, inspiring idea.
        </p>
        <div className="space-y-2">
          <label htmlFor={`dream-${dreamIndex}`} className="text-sm font-medium">Dream {dreamIndex + 1}</label>
          <Textarea id={`dream-${dreamIndex}`} placeholder={`e.g., I want to start a successful business`} value={responses.dreams[dreamIndex]} onChange={(e) => handleDreamChange(dreamIndex, e.target.value)} rows={3}/>
        </div>
      </div>
    );
  };

  const renderDreamExpansionStep = (dreamIndex: number) => {
     const stepNumber = dreamIndex * 3 + 3; // Steps 3, 6, 9
     const dream = responses.dreams[dreamIndex];
     return (
       <div className="space-y-6">
         <h3 className="text-lg font-semibold">Step {stepNumber}: Expand Dream {dreamIndex + 1} - 10 Year Visions</h3>
         <p className="text-sm text-muted-foreground">For your dream "{dream || `Dream ${dreamIndex + 1}`}", describe three specific visions of where you see yourself in 10 years.</p>
         {[0, 1, 2].map((subDreamIndex) => (
           <div key={`subdream-vision-${dreamIndex}-${subDreamIndex}`} className="space-y-2 border-t pt-3 first:border-t-0">
             <label htmlFor={`subdream-vision-${dreamIndex}-${subDreamIndex}`} className="text-sm font-medium">Vision {subDreamIndex + 1}</label>
             <Textarea id={`subdream-vision-${dreamIndex}-${subDreamIndex}`} placeholder={`e.g., My business will operate internationally`} value={responses.subDreams[`dream_${dreamIndex}`]?.[subDreamIndex]?.vision || ''} onChange={(e) => handleSubDreamVisionChange(dreamIndex, subDreamIndex, e.target.value)} rows={2}/>
           </div>
         ))}
       </div>
     );
   };

  const renderDreamReflectionStep = (dreamIndex: number) => {
    const stepNumber = dreamIndex * 3 + 4; // Steps 4, 7, 10
    const dream = responses.dreams[dreamIndex];
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Step {stepNumber}: Reflect on Dream {dreamIndex + 1} Visions</h3>
        <p className="text-sm text-muted-foreground">For your dream "{dream || `Dream ${dreamIndex + 1}`}", reflect on *why* each 10-year vision is important to you.</p>
        {[0, 1, 2].map((subDreamIndex) => (
          <div key={`subdream-why-${dreamIndex}-${subDreamIndex}`} className="space-y-3 border-t pt-4 first:border-t-0">
             <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Regarding Vision {subDreamIndex + 1}: "{responses.subDreams[`dream_${dreamIndex}`]?.[subDreamIndex]?.vision || '...'}"</p>
             <label htmlFor={`subdream-why-${dreamIndex}-${subDreamIndex}`} className="text-sm font-medium block pt-1">Why is this vision important? Why thrive here?</label>
             <Textarea id={`subdream-why-${dreamIndex}-${subDreamIndex}`} placeholder="Reflect on your motivation..." value={responses.subDreams[`dream_${dreamIndex}`]?.[subDreamIndex]?.why || ''} onChange={(e) => handleSubDreamWhyChange(dreamIndex, subDreamIndex, e.target.value)} rows={2}/>
          </div>
        ))}
      </div>
    );
  };

  const renderEssayStep = (essayIndex: number) => {
     const stepNumber = 10 + essayIndex; // Steps 11 and 12
     const isGodEssay = essayIndex === 1;
     const prompt = isGodEssay ? "What would you do if you were God for a day?" : "On what would you spend 1 million euros?";
     const description = isGodEssay ? "Focus on change, creation, influence, and positive impact." : "Describe how this aligns with your dreams and values.";
     const value = isGodEssay ? responses.essayGod : responses.essayMillion;
     const essayType = isGodEssay ? 'essayGod' : 'essayMillion';

     return (
       <div className="space-y-6">
         <h3 className="text-lg font-semibold">Step {stepNumber}: Reflective Writing</h3>
         <p className="text-sm text-muted-foreground">Write a brief essay (around 300 characters).</p>
         <div className="space-y-2">
           <label htmlFor={`essay-${essayIndex}`} className="text-sm font-medium block">{prompt}</label>
           <p className="text-xs text-muted-foreground">{description}</p>
           <Textarea id={`essay-${essayIndex}`} placeholder="Your reflections..." value={value} onChange={(e) => handleEssayChange(essayType, e.target.value)} rows={4} maxLength={300}/>
           <p className="text-xs text-muted-foreground text-right">{value.length} / 300</p>
         </div>
       </div>
     );
   };

  // --- Main Step Renderer ---
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderIntroductionStep();
      // Dream 1
      case 2: return renderDreamInputStep(0);
      case 3: return renderDreamExpansionStep(0);
      case 4: return renderDreamReflectionStep(0);
      // Dream 2
      case 5: return renderDreamInputStep(1);
      case 6: return renderDreamExpansionStep(1);
      case 7: return renderDreamReflectionStep(1);
      // Dream 3
      case 8: return renderDreamInputStep(2);
      case 9: return renderDreamExpansionStep(2);
      case 10: return renderDreamReflectionStep(2);
      // Essays
      case 11: return renderEssayStep(1); // God Essay
      case 12: return renderEssayStep(2); // Million Essay
      default: return <div>Processing...</div>;
    }
  };

  // --- Navigation and Submission (Updated Validation) ---
  const handleNextStep = () => {
    setError(null);
    // Validation logic based on NEW step numbers
    if (currentStep === 2 && !responses.dreams[0]?.trim()) { setError("Please enter your first dream."); return; }
    if (currentStep === 3 && (!responses.subDreams['dream_0'] || responses.subDreams['dream_0'].length < 3 || responses.subDreams['dream_0'].some(sd => !sd.vision.trim()))) { setError("Please describe all 3 visions for Dream 1."); return; }
    if (currentStep === 4 && (!responses.subDreams['dream_0'] || responses.subDreams['dream_0'].length < 3 || responses.subDreams['dream_0'].some(sd => !sd.why.trim()))) { setError("Please reflect on the 'why' for all 3 visions for Dream 1."); return; }
    if (currentStep === 5 && !responses.dreams[1]?.trim()) { setError("Please enter your second dream."); return; }
    if (currentStep === 6 && (!responses.subDreams['dream_1'] || responses.subDreams['dream_1'].length < 3 || responses.subDreams['dream_1'].some(sd => !sd.vision.trim()))) { setError("Please describe all 3 visions for Dream 2."); return; }
    if (currentStep === 7 && (!responses.subDreams['dream_1'] || responses.subDreams['dream_1'].length < 3 || responses.subDreams['dream_1'].some(sd => !sd.why.trim()))) { setError("Please reflect on the 'why' for all 3 visions for Dream 2."); return; }
    if (currentStep === 8 && !responses.dreams[2]?.trim()) { setError("Please enter your third dream."); return; }
    if (currentStep === 9 && (!responses.subDreams['dream_2'] || responses.subDreams['dream_2'].length < 3 || responses.subDreams['dream_2'].some(sd => !sd.vision.trim()))) { setError("Please describe all 3 visions for Dream 3."); return; }
    if (currentStep === 10 && (!responses.subDreams['dream_2'] || responses.subDreams['dream_2'].length < 3 || responses.subDreams['dream_2'].some(sd => !sd.why.trim()))) { setError("Please reflect on the 'why' for all 3 visions for Dream 3."); return; }
    if (currentStep === 11 && !responses.essayGod.trim()) { setError("Please complete the first essay."); return; }
    if (currentStep === 12 && !responses.essayMillion.trim()) { setError("Please complete the second essay."); return; }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousStep = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    console.log("Submitting Dreamscapes:", { responses });

    // Final validation check
    if (!responses.essayGod.trim() || !responses.essayMillion.trim()) {
       setError("Please complete both essays before finishing.");
       setIsLoading(false);
       return;
    }

    try {
      const apiResponse = await fetch('/api/workshop/dreamscapes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'Failed to submit responses');
      }
      setIsComplete(true);
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(`Submission failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render ---
  if (isComplete) {
    return (
      <Card>
        <CardHeader><CardTitle>Workshop Complete!</CardTitle></CardHeader>
        <CardContent><p>Thank you for completing the Dreamscapes workshop. Your responses have been saved.</p></CardContent>
         <CardFooter>
            <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
            </Link>
         </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dreamscapes: Envision Your Future</CardTitle>
        {/* Hide description after intro step? Optional */}
        {currentStep > 1 && <CardDescription>A workshop to explore your dreams and motivations.</CardDescription>}
        <div className="flex justify-between items-center mt-2 gap-4">
           <Progress value={(currentStep / totalSteps) * 100} className="flex-1" />
           <div className="flex items-center space-x-2">
             <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
               Step {currentStep}/{totalSteps}
             </span>
             {/* Display Timer only if duration > 0 */}
             {stepDurations[currentStep] > 0 && (
                <span className="text-sm font-medium text-muted-foreground w-[60px] text-right tabular-nums">
                 {formatTime(timeLeft)}
                </span>
             )}
           </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-[350px]">
        {renderCurrentStep()}
        {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handlePreviousStep} variant="outline" disabled={currentStep === 1 || isLoading}>
          Previous
        </Button>
        <Button onClick={handleNextStep} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {currentStep === totalSteps ? 'Finish Workshop' : 'Next Step'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DreamscapesClientComponent;
