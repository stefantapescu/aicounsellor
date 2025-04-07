"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Lightbulb, ArrowRight, ArrowLeft, AlertCircle, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { saveConscientiousnessScore } from './actions'; // Server action (to be created)

// Define game stage structures
interface Task { id: string; title: string; importance: string; urgency: string; icon: string; }
interface Activity { id: string; name: string; description: string; icon: string; }
interface DecisionOption { id: string; text: string; score: number; feedback: string; }
interface DocumentSection { heading: string; content: string; hasError: boolean; errorType: string; }
interface Resource { id: string; name: string; description: string; icon: string; }

interface GameStage {
  id: number;
  type: "prioritization" | "time_allocation" | "decision_scenario" | "quality_control" | "resource_management";
  title: string;
  description: string;
  tasks?: Task[];
  activities?: Activity[];
  totalHours?: number;
  options?: DecisionOption[];
  image?: string;
  document?: { title: string; sections: DocumentSection[] };
  resources?: Resource[];
  totalPoints?: number;
}


// Game data for Time Crunch Challenge
const gameData: GameStage[] = [
  {
    id: 1,
    type: "prioritization",
    title: "Task Prioritization",
    description: "You have a critical presentation tomorrow. Arrange these tasks in the order you would complete them.",
    tasks: [
      { id: "task1", title: "Gather data", importance: "High", urgency: "High", icon: "📊" },
      { id: "task2", title: "Create slides", importance: "High", urgency: "Medium", icon: "🖼️" },
      { id: "task3", title: "Send team reminders", importance: "Low", urgency: "Low", icon: "📧" },
      { id: "task4", title: "Rehearse presentation", importance: "Medium", urgency: "Medium", icon: "🎤" },
    ],
  },
  {
    id: 2,
    type: "time_allocation",
    title: "Time Management",
    description: "You have 8 hours to complete your project. How would you allocate your time across these activities?",
    activities: [
      { id: "act1", name: "Research", description: "Gathering necessary information", icon: "🔍" },
      { id: "act2", name: "Planning", description: "Organizing your approach", icon: "📝" },
      { id: "act3", name: "Execution", description: "Doing the actual work", icon: "⚙️" },
      { id: "act4", name: "Review", description: "Checking for errors and improvements", icon: "✓" },
    ],
    totalHours: 8,
  },
  {
    id: 3,
    type: "decision_scenario",
    title: "Handling Interruptions",
    description: "You're deep in work when a colleague asks for help with an unrelated issue. What do you do?",
    options: [
      { id: "a", text: "Help them right away, even if it delays your work", score: 1, feedback: "You prioritize helping others, but this may impact your ability to meet deadlines." },
      { id: "b", text: "Tell them you'll help after you finish your current task", score: 2, feedback: "You balance being helpful with maintaining your productivity." },
      { id: "c", text: "Politely decline, explaining you need to focus on your deadline", score: 3, feedback: "You maintain strong boundaries to ensure you meet your commitments." },
    ],
    image: "/placeholder.svg?height=300&width=500", // Placeholder image
  },
  {
    id: 4,
    type: "quality_control",
    title: "Attention to Detail",
    description: "Review this document and identify the errors before submission.",
    document: {
      title: "Project Proposal",
      sections: [
        { heading: "Executive Summary", content: "This project aims to increase efficiency by 15% while reducing costs by 10%.", hasError: false, errorType: "" },
        { heading: "Budget Breakdown", content: "Total budget: $75,000\nPersonnel: $45,000\nEquipment: $20,000\nMiscellaneous: $15,000", hasError: true, errorType: "calculation" },
        { heading: "Timeline", content: "Phase 1: January - March\nPhase 2: April - June\nPhase 3: July - September\nProject Completion: October 31st", hasError: false, errorType: "" },
        { heading: "Team Members", content: "Project Lead: Sarah Johnson\nAnalyst: Michael Chen\nDeveloper: David Smith\nDesigner: Emily Wong", hasError: true, errorType: "formatting" },
      ],
    },
  },
  {
    id: 5,
    type: "resource_management",
    title: "Resource Allocation",
    description: "You have limited resources for your project. Adjust the sliders to allocate your budget across different areas.",
    resources: [
      { id: "res1", name: "Quality", description: "Higher quality materials and processes", icon: "⭐" },
      { id: "res2", name: "Speed", description: "Faster delivery and implementation", icon: "⚡" },
      { id: "res3", name: "Cost", description: "Keeping expenses low", icon: "💰" },
    ],
    totalPoints: 100,
  },
];

interface ConscientiousnessClientProps {
  userId: string;
}

export default function ConscientiousnessClient({ userId }: ConscientiousnessClientProps) {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});

  // State for prioritization game
  const [taskOrder, setTaskOrder] = useState<string[]>([]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // State for time allocation game
  const [timeAllocations, setTimeAllocations] = useState<{ [key: string]: number }>({
    act1: 2, act2: 2, act3: 2, act4: 2,
  });

  // State for quality control game
  const [foundErrors, setFoundErrors] = useState<{ [key: string]: boolean }>({});

  // State for resource management game
  const [resourceAllocations, setResourceAllocations] = useState<{ [key: string]: number }>({
    res1: 33, res2: 33, res3: 34,
  });

  // Initialize task order when stage changes
  useEffect(() => {
    const stage = gameData[currentStage];
    if (stage?.type === "prioritization" && stage.tasks) {
      setTaskOrder(stage.tasks.map((task) => task.id).sort(() => Math.random() - 0.5));
    }
    // Reset other game-specific states if needed
    setFoundErrors({});
    // Reset sliders to default if needed, ensuring total adds up
    if (stage?.type === "time_allocation") {
       setTimeAllocations({ act1: 2, act2: 2, act3: 2, act4: 2 });
    }
    if (stage?.type === "resource_management") {
       setResourceAllocations({ res1: 33, res2: 33, res3: 34 });
    }
  }, [currentStage]);

  const startGame = () => {
    setShowInstructions(false);
  };

  const completeStage = async (stageScore: number) => {
    const newTotalScore = score + stageScore;
    setScore(newTotalScore);

    if (currentStage < gameData.length - 1) {
      setCurrentStage(currentStage + 1);
    } else {
      setIsCompleting(true);
      const finalScore = Math.round(newTotalScore / gameData.length); // Average score
      try {
        await saveConscientiousnessScore(userId, finalScore);
        setShowResults(true);
      } catch (error) {
        console.error("Failed to save score:", error);
        // Handle error display
      } finally {
        setIsCompleting(false);
      }
    }
  };

  // --- Game Logic Handlers ---

  const handleDragStart = (taskId: string) => setDraggedTask(taskId);
  const handleDragOver = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    if (!draggedTask || draggedTask === targetTaskId) return;
    const newOrder = [...taskOrder];
    const draggedIndex = newOrder.indexOf(draggedTask);
    const targetIndex = newOrder.indexOf(targetTaskId);
    if (draggedIndex !== -1 && targetIndex !== -1) {
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedTask);
      setTaskOrder(newOrder);
    }
  };
  const handleDragEnd = () => setDraggedTask(null);

  const submitTaskOrder = () => {
    const stage = gameData[currentStage];
    if (stage.type !== "prioritization" || !stage.tasks) return;
    const tasks = stage.tasks;
    const idealOrder = tasks.sort((a, b) => {
      const impScore = (imp: string) => (imp === "High" ? 3 : imp === "Medium" ? 2 : 1);
      const urgScore = (urg: string) => (urg === "High" ? 3 : urg === "Medium" ? 2 : 1);
      return (impScore(b.importance) * 2 + urgScore(b.urgency)) - (impScore(a.importance) * 2 + urgScore(a.urgency));
    }).map(task => task.id);

    let matchScore = 0;
    taskOrder.forEach((taskId, index) => {
      const idealIndex = idealOrder.indexOf(taskId);
      const positionDiff = Math.abs(index - idealIndex);
      matchScore += positionDiff === 0 ? 3 : positionDiff === 1 ? 2 : positionDiff === 2 ? 1 : 0;
    });
    const maxPossibleScore = tasks.length * 3;
    const normalizedScore = Math.round((matchScore / maxPossibleScore) * 100);
    setAnswers({ ...answers, [stage.id]: taskOrder });
    completeStage(normalizedScore);
  };

  const updateTimeAllocation = (activityId: string, hours: number[]) => {
    const stage = gameData[currentStage];
    if (stage.type !== "time_allocation" || !stage.totalHours) return;
    const newHours = hours[0];
    const currentTotal = Object.entries(timeAllocations).reduce((sum, [key, val]) => key === activityId ? sum : sum + val, 0);
    const maxAllowed = stage.totalHours - currentTotal;
    const clampedHours = Math.max(0, Math.min(newHours, maxAllowed));

    // Adjust other sliders if necessary to maintain total
    const updatedAllocations = { ...timeAllocations, [activityId]: clampedHours };
    const newTotal = Object.values(updatedAllocations).reduce((sum, val) => sum + val, 0);

    if (newTotal > stage.totalHours) {
       // Simple adjustment: reduce the last changed slider if total exceeds
       updatedAllocations[activityId] -= (newTotal - stage.totalHours);
    }
     // Ensure non-negative values after adjustment
     if (updatedAllocations[activityId] < 0) updatedAllocations[activityId] = 0;

    setTimeAllocations(updatedAllocations);
  };


  const submitTimeAllocation = () => {
    const stage = gameData[currentStage];
    if (stage.type !== "time_allocation" || !stage.totalHours) return;
    const currentTotal = Object.values(timeAllocations).reduce((sum, val) => sum + val, 0);
    if (currentTotal !== stage.totalHours) {
       alert(`Total allocated hours must be exactly ${stage.totalHours}. Currently: ${currentTotal}`);
       return;
    }

    const idealAllocation = { act1: 2, act2: 2, act3: 3, act4: 1 };
    let totalDeviation = 0;
    Object.keys(idealAllocation).forEach(actId => {
      totalDeviation += Math.abs(idealAllocation[actId as keyof typeof idealAllocation] - timeAllocations[actId]);
    });
    const maxDeviation = stage.totalHours * 2; // Max possible deviation
    const normalizedScore = Math.round(Math.max(0, 100 - (totalDeviation / maxDeviation) * 100));
    setAnswers({ ...answers, [stage.id]: timeAllocations });
    completeStage(normalizedScore);
  };

  const submitDecision = (optionScore: number) => {
    const stage = gameData[currentStage];
    if (stage.type !== "decision_scenario") return;
    const normalizedScore = Math.round(((optionScore - 1) / 2) * 100); // Scale 1-3 to 0-100
    setAnswers({ ...answers, [stage.id]: optionScore }); // Store original score or choice ID if needed
    completeStage(normalizedScore);
  };

  const toggleError = (sectionIndex: number) => {
    const sectionId = `section${sectionIndex}`;
    setFoundErrors(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const submitQualityControl = () => {
    const stage = gameData[currentStage];
    if (stage.type !== "quality_control" || !stage.document) return;
    const sections = stage.document.sections;
    let correctFlags = 0;
    let incorrectFlags = 0;
    const totalErrors = sections.filter(s => s.hasError).length;

    sections.forEach((section, index) => {
      const sectionId = `section${index}`;
      const userFlagged = !!foundErrors[sectionId];
      if (section.hasError && userFlagged) {
        correctFlags++;
      } else if (!section.hasError && userFlagged) {
        incorrectFlags++;
      }
    });

    // Score based on correct flags minus penalty for incorrect flags
    const score = totalErrors > 0 ? (correctFlags / totalErrors) * 100 - (incorrectFlags * 25) : (incorrectFlags > 0 ? 0 : 100);
    const normalizedScore = Math.max(0, Math.min(100, Math.round(score))); // Clamp score between 0 and 100

    setAnswers({ ...answers, [stage.id]: foundErrors });
    completeStage(normalizedScore);
  };


 const updateResourceAllocation = (resourceId: string, value: number[]) => {
    const stage = gameData[currentStage];
    if (stage.type !== "resource_management" || !stage.totalPoints) return;

    const newValue = value[0];
    const currentAllocations = { ...resourceAllocations };
    const oldValue = currentAllocations[resourceId];
    const diff = newValue - oldValue;

    // Calculate sum excluding the current slider
    let otherSum = 0;
    Object.keys(currentAllocations).forEach(key => {
      if (key !== resourceId) {
        otherSum += currentAllocations[key];
      }
    });

    // Ensure the new value doesn't make the total exceed 100
    const clampedNewValue = Math.min(newValue, stage.totalPoints - otherSum);
    const actualDiff = clampedNewValue - oldValue; // The actual change applied

    currentAllocations[resourceId] = clampedNewValue;

    // Distribute the difference proportionally among other sliders if total is now under 100
    const currentTotal = Object.values(currentAllocations).reduce((sum, v) => sum + v, 0);
    let remainingDiff = stage.totalPoints - currentTotal;

    if (remainingDiff > 0) {
        let adjustableSum = 0;
        Object.keys(currentAllocations).forEach(key => {
            if (key !== resourceId) {
                adjustableSum += currentAllocations[key];
            }
        });

        if (adjustableSum > 0) {
             Object.keys(currentAllocations).forEach(key => {
                 if (key !== resourceId) {
                     const proportion = currentAllocations[key] / adjustableSum;
                     const adjustment = Math.round(remainingDiff * proportion);
                     currentAllocations[key] += adjustment;
                 }
             });
             // Adjust for rounding errors to ensure total is exactly 100
             const finalTotal = Object.values(currentAllocations).reduce((sum, v) => sum + v, 0);
             const roundingError = stage.totalPoints - finalTotal;
             if (roundingError !== 0) {
                 // Add rounding error to the first adjustable slider (or handle differently)
                 const firstOtherKey = Object.keys(currentAllocations).find(key => key !== resourceId);
                 if(firstOtherKey) currentAllocations[firstOtherKey] += roundingError;
             }
        } else if (Object.keys(currentAllocations).length > 1) {
             // If other sliders are 0, distribute equally
             const otherKeys = Object.keys(currentAllocations).filter(key => key !== resourceId);
             const share = Math.floor(remainingDiff / otherKeys.length);
             let remainder = remainingDiff % otherKeys.length;
             otherKeys.forEach((key, idx) => {
                 currentAllocations[key] += share + (idx < remainder ? 1 : 0);
             });
        }
    }


    setResourceAllocations(currentAllocations);
};


  const submitResourceAllocation = () => {
    const stage = gameData[currentStage];
    if (stage.type !== "resource_management" || !stage.totalPoints) return;
    const currentTotal = Object.values(resourceAllocations).reduce((sum, val) => sum + val, 0);
     if (Math.round(currentTotal) !== stage.totalPoints) { // Use Math.round for potential float issues
       alert(`Total allocated points must be exactly ${stage.totalPoints}. Currently: ${currentTotal.toFixed(0)}`);
       return;
     }

    const idealAllocation = { res1: 40, res2: 30, res3: 30 };
    let totalDeviation = 0;
    Object.keys(idealAllocation).forEach(resId => {
      totalDeviation += Math.abs(idealAllocation[resId as keyof typeof idealAllocation] - resourceAllocations[resId]);
    });
    const maxDeviation = 2 * stage.totalPoints; // Max possible deviation
    const normalizedScore = Math.round(Math.max(0, 100 - (totalDeviation / maxDeviation) * 100));
    setAnswers({ ...answers, [stage.id]: resourceAllocations });
    completeStage(normalizedScore);
  };

  const handleContinueToNext = () => {
    setIsCompleting(true);
    const finalScore = Math.round(score / gameData.length);
    localStorage.setItem("conscientiousness_score", finalScore.toString());
    // Navigate to the next game (Extraversion)
    router.push("/personalityradar/extraversion");
  };

  // Current stage data
  const currentStageData = gameData[currentStage];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-16 pt-20"> {/* Added pt-20 for progress bar */}
      <AnimatePresence mode="wait">
        {showInstructions ? (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-8 overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-md text-center"
          >
             <div className="flex justify-center mb-4">
               <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600/20 to-blue-600/40">
                 <Lightbulb className="h-8 w-8 text-indigo-300" />
               </div>
             </div>
            <h1 className="mb-4 text-3xl font-bold text-white">Time Crunch Challenge</h1>
            <h2 className="mb-6 text-xl font-semibold text-indigo-300">(Conscientiousness Assessment)</h2>

            <div className="mb-8 text-left space-y-4 text-purple-200 max-w-3xl mx-auto">
               <p>Welcome to the Time Crunch Challenge! This series of mini-games assesses your Conscientiousness – your tendency towards organization, responsibility, and attention to detail.</p>
               <p>You'll face 5 different scenarios testing:</p>
               <ul className="list-disc list-inside pl-4 space-y-1">
                   <li>Task Prioritization</li>
                   <li>Time Management</li>
                   <li>Handling Interruptions</li>
                   <li>Attention to Detail</li>
                   <li>Resource Allocation</li>
               </ul>
               <p>Read each scenario carefully and respond based on how you would typically handle the situation. There are no right or wrong answers, just insights into your work style!</p>
            </div>

            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 hover:scale-105"
            >
              Start Challenge <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        ) : !showResults ? (
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-8 overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-md"
          >
            <h2 className="mb-4 text-2xl font-bold text-white">{currentStageData.title}</h2>
            <p className="mb-6 text-lg text-purple-200">{currentStageData.description}</p>

            {/* Render specific game UI based on type */}
            {currentStageData.type === "prioritization" && currentStageData.tasks && (
              <div className="space-y-6">
                <div className="mb-4 rounded-xl bg-indigo-900/20 p-4">
                  <p className="text-purple-200">Drag and drop the tasks to arrange them in the order you would complete them.</p>
                </div>
                <div className="space-y-3">
                  {taskOrder.map((taskId, index) => {
                    const task = currentStageData.tasks!.find(t => t.id === taskId);
                    if (!task) return null;
                    return (
                      <div key={taskId} draggable onDragStart={() => handleDragStart(taskId)} onDragOver={(e) => handleDragOver(e, taskId)} onDragEnd={handleDragEnd}
                           className={`flex cursor-grab items-center justify-between rounded-xl border p-4 transition-all duration-200 hover:border-indigo-500/30 hover:bg-indigo-900/20 active:cursor-grabbing ${draggedTask === taskId ? 'border-indigo-500/50 bg-indigo-900/30' : 'border-purple-500/20 bg-purple-900/10'}`}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600/20 to-indigo-600/40 text-xl">{task.icon}</div>
                          <div>
                            <h3 className="font-medium text-white">{task.title}</h3>
                            <div className="flex gap-2 text-xs">
                              <span className={`rounded-full px-2 py-0.5 ${task.importance === "High" ? "bg-pink-900/30 text-pink-300" : task.importance === "Medium" ? "bg-purple-900/30 text-purple-300" : "bg-blue-900/30 text-blue-300"}`}>Imp: {task.importance}</span>
                              <span className={`rounded-full px-2 py-0.5 ${task.urgency === "High" ? "bg-red-900/30 text-red-300" : task.urgency === "Medium" ? "bg-yellow-900/30 text-yellow-300" : "bg-green-900/30 text-green-300"}`}>Urg: {task.urgency}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-900/40 text-indigo-300">{index + 1}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center pt-4">
                  <Button onClick={submitTaskOrder} className="bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 hover:scale-105">Submit Order <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {currentStageData.type === "time_allocation" && currentStageData.activities && (
              <div className="space-y-6">
                 <div className="mb-4 rounded-xl bg-indigo-900/20 p-4">
                   <p className="text-purple-200">Adjust the sliders. Total must equal {currentStageData.totalHours} hours.</p>
                 </div>
                <div className="space-y-6">
                  {currentStageData.activities.map(activity => (
                    <div key={activity.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><span className="text-xl">{activity.icon}</span><span className="font-medium text-white">{activity.name}</span></div>
                        <span className="rounded-full bg-indigo-900/30 px-3 py-1 text-sm text-indigo-300">{timeAllocations[activity.id]} hours</span>
                      </div>
                      <p className="mb-2 text-sm text-purple-200">{activity.description}</p>
                      <Slider value={[timeAllocations[activity.id]]} min={0} max={currentStageData.totalHours} step={0.5} onValueChange={(value) => updateTimeAllocation(activity.id, value)} className="py-2" />
                    </div>
                  ))}
                </div>
                 <div className="rounded-xl bg-indigo-900/20 p-4">
                   <div className="flex items-center justify-between">
                     <span className="font-medium text-white">Total Allocated</span>
                     <span className={`font-bold ${Object.values(timeAllocations).reduce((sum, val) => sum + val, 0) === currentStageData.totalHours ? 'text-green-400' : 'text-red-400'}`}>
                       {Object.values(timeAllocations).reduce((sum, val) => sum + val, 0)} / {currentStageData.totalHours} hours
                     </span>
                   </div>
                 </div>
                <div className="flex justify-center pt-4">
                  <Button onClick={submitTimeAllocation} disabled={Object.values(timeAllocations).reduce((sum, val) => sum + val, 0) !== currentStageData.totalHours} className="bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 hover:scale-105">Submit Allocation <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </div>
            )}

             {currentStageData.type === "decision_scenario" && currentStageData.options && (
               <div className="space-y-4">
                 {currentStageData.options.map((option) => (
                   <Button key={option.id} onClick={() => submitDecision(option.score)} variant="outline" className="w-full justify-start border-purple-500/20 bg-purple-900/10 p-4 text-left text-purple-200 transition-all duration-300 hover:border-indigo-500/30 hover:bg-indigo-900/20 hover:text-white">
                     {option.text}
                   </Button>
                 ))}
               </div>
             )}

             {currentStageData.type === "quality_control" && currentStageData.document && (
               <div className="space-y-6">
                 <div className="mb-4 rounded-xl bg-indigo-900/20 p-4">
                   <div className="flex items-start gap-2"><AlertCircle className="mt-1 h-5 w-5 shrink-0 text-indigo-300" /><p className="text-purple-200">Click sections containing errors.</p></div>
                 </div>
                 <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-6">
                   <h3 className="mb-4 text-xl font-bold text-white">{currentStageData.document.title}</h3>
                   <div className="space-y-6">
                     {currentStageData.document.sections.map((section, index) => (
                       <div key={index} onClick={() => toggleError(index)} className={`cursor-pointer rounded-lg p-4 transition-all duration-200 ${foundErrors[`section${index}`] ? 'border border-indigo-500/50 bg-indigo-900/30' : 'bg-purple-900/10 hover:bg-indigo-900/20'}`}>
                         <div className="mb-2 flex items-center justify-between"><h4 className="font-medium text-white">{section.heading}</h4>{foundErrors[`section${index}`] && <div className="rounded-full bg-indigo-900/40 px-3 py-1 text-xs text-indigo-300">Error Flagged</div>}</div>
                         <p className="whitespace-pre-line text-purple-200">{section.content}</p>
                       </div>
                     ))}
                   </div>
                 </div>
                 <div className="flex justify-center pt-4">
                   <Button onClick={submitQualityControl} className="bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 hover:scale-105">Submit Review <ArrowRight className="ml-2 h-4 w-4" /></Button>
                 </div>
               </div>
             )}

             {currentStageData.type === "resource_management" && currentStageData.resources && (
               <div className="space-y-6">
                 <div className="mb-4 rounded-xl bg-indigo-900/20 p-4">
                   <div className="flex items-start gap-2"><BarChart3 className="mt-1 h-5 w-5 shrink-0 text-indigo-300" /><p className="text-purple-200">Allocate {currentStageData.totalPoints} points across priorities.</p></div>
                 </div>
                 <div className="space-y-6">
                   {currentStageData.resources.map(resource => (
                     <div key={resource.id} className="space-y-2">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2"><span className="text-xl">{resource.icon}</span><span className="font-medium text-white">{resource.name}</span></div>
                         <span className="rounded-full bg-indigo-900/30 px-3 py-1 text-sm text-indigo-300">{resourceAllocations[resource.id]} points</span>
                       </div>
                       <p className="mb-2 text-sm text-purple-200">{resource.description}</p>
                       <Slider value={[resourceAllocations[resource.id]]} min={0} max={currentStageData.totalPoints} step={1} onValueChange={(value) => updateResourceAllocation(resource.id, value)} className="py-2" />
                     </div>
                   ))}
                 </div>
                 <div className="rounded-xl bg-indigo-900/20 p-4">
                   <div className="flex items-center justify-between">
                     <span className="font-medium text-white">Total Allocated</span>
                     <span className={`font-bold ${Math.round(Object.values(resourceAllocations).reduce((sum, val) => sum + val, 0)) === currentStageData.totalPoints ? 'text-green-400' : 'text-red-400'}`}>
                       {Math.round(Object.values(resourceAllocations).reduce((sum, val) => sum + val, 0))} / {currentStageData.totalPoints} points
                     </span>
                   </div>
                 </div>
                 <div className="flex justify-center pt-4">
                   <Button onClick={submitResourceAllocation} disabled={Math.round(Object.values(resourceAllocations).reduce((sum, val) => sum + val, 0)) !== currentStageData.totalPoints} className="bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 hover:scale-105">Submit Allocation <ArrowRight className="ml-2 h-4 w-4" /></Button>
                 </div>
               </div>
             )}

          </motion.div>
        ) : (
          <motion.div
            key="completion"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl rounded-3xl border border-purple-500/20 bg-black/40 p-8 text-center backdrop-blur-md shadow-xl"
          >
            <h2 className="mb-4 text-2xl font-bold text-white">Conscientiousness Challenge Complete!</h2>
            <p className="mb-6 text-lg text-purple-200">Your score has been recorded.</p>
            <Button
              onClick={handleContinueToNext}
              disabled={isCompleting}
              className="bg-gradient-to-r from-indigo-600 to-blue-600"
            >
              {isCompleting ? "Processing..." : "Continue to Next Assessment"}
              {!isCompleting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
