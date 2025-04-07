"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { saveOpennessScore } from './actions'; // Server action to save score (to be created)
import { useRouter } from 'next/navigation'; // For navigation after completion
import { Progress } from '@/components/ui/progress'; // For progress bar

// Define scenario structure
interface Choice {
  text: string;
  points: number; // 1: Low, 2: Moderate, 3: High Openness
  feedback: string;
}

interface Scenario {
  id: number;
  description: string;
  choices: Choice[];
}

// Game Data (Scenarios based on the prompt)
const scenarios: Scenario[] = [
  {
    id: 1,
    description: "As you trek through a dense forest, you reach a fork in the path. To your left, a well-worn trail leads to a familiar village. To your right, an overgrown path vanishes into the unknown. What do you do?",
    choices: [
      { text: "Take the left path to the village.", points: 1, feedback: "You arrive at the village, where you rest and gather supplies, but you can't help but wonder what lay down the other path." },
      { text: "Take the right path into the unknown.", points: 3, feedback: "You venture into the unknown, discovering a hidden grove filled with rare plants and a sense of wonder." },
      { text: "Climb a nearby hill to survey both paths before deciding.", points: 2, feedback: "From the hill, you see that the right path leads to a distant waterfall. You decide to take it, but proceed carefully, balancing curiosity with caution." },
    ],
  },
  {
    id: 2,
    description: "A wide river blocks your path, its waters swift and deep. The far bank is shrouded in mist, and no bridge is in sight. You must find a way to cross.",
    choices: [
      { text: "Look for a safe crossing, such as a shallow spot or a natural bridge.", points: 1, feedback: "After searching, you find a sturdy fallen tree spanning the river. You cross carefully, staying dry and safe." },
      { text: "Build a raft from materials in the forest.", points: 2, feedback: "You gather logs and vines, crafting a simple raft. With effort, you paddle across, feeling accomplished." },
      { text: "Swim across, embracing the challenge.", points: 3, feedback: "You dive into the cold water, feeling the rush of the current. With determination, you swim across, exhilarated by the challenge." },
    ],
  },
  {
    id: 3,
    description: "You stumble upon an ancient ruin adorned with mysterious symbols. A heavy door is locked, hinting at secrets within. What do you do?",
    choices: [
      { text: "Try to decipher the symbols to unlock the door.", points: 3, feedback: "After studying the symbols, you crack the code and the door creaks open, revealing a chamber filled with ancient artifacts." },
      { text: "Look for a hidden key or mechanism to open the door.", points: 2, feedback: "You search around and find a lever hidden in the wall. Pulling it, the door opens, granting you access to the ruin." },
      { text: "Decide it's not worth the effort and continue on your journey.", points: 1, feedback: "You leave the ruin behind, focusing on your quest for Eldoria, though a part of you wonders what lay inside." },
    ],
  },
  {
    id: 4,
    description: "A fellow traveler offers you a detailed map of the region, but requests something in return. How do you respond?",
    choices: [
      { text: "Politely decline and continue without the map.", points: 1, feedback: "You decline the offer and rely on your own navigation skills, feeling independent but perhaps missing out on valuable information." },
      { text: "Trade an item for the map.", points: 2, feedback: "You trade a small item for the map, gaining a useful tool for your journey." },
      { text: "Try to persuade the traveler to share it for free by sharing a story or knowledge.", points: 3, feedback: "You share an intriguing tale, and the traveler, impressed, gives you the map for free, fostering a new connection." },
    ],
  },
  {
    id: 5,
    description: "You discover a cave glowing with strange crystals. Inside, three paths diverge: one echoes with odd noises, one glimmers with faint light, and one looks plain and ordinary. Which do you choose?",
    choices: [
      { text: "Take the ordinary path, as it seems safest.", points: 1, feedback: "You take the ordinary path and emerge safely on the other side, though you feel a twinge of regret for not exploring further." },
      { text: "Follow the path with the faint light, curious about its source.", points: 2, feedback: "The faint light leads you to a small chamber with glowing crystals, a beautiful sight that fills you with wonder." },
      { text: "Investigate the path with strange noises, despite the risk.", points: 3, feedback: "You brave the strange noises and discover a hidden underground lake, its waters shimmering with bioluminescent life." },
    ],
  },
];

interface ExplorerDilemmaClientProps {
  userId: string;
}

export default function ExplorerDilemmaClient({ userId }: ExplorerDilemmaClientProps) {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();

  const currentScenario = scenarios[currentScenarioIndex];
  const progressPercent = ((currentScenarioIndex + (isComplete ? 1 : 0)) / scenarios.length) * 100;

  const handleChoice = (choice: Choice) => {
    setSelectedChoice(choice);
    setShowFeedback(true);
  };

  const handleContinue = async () => {
    if (!selectedChoice) return;

    const newScore = totalScore + selectedChoice.points;
    setTotalScore(newScore);

    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
    } else {
      // Game finished
      setIsSaving(true);
      try {
        // Scale score 5-15 to 0-100
        const scaledScore = Math.round(((newScore - 5) / (15 - 5)) * 100);
        await saveOpennessScore(userId, scaledScore); // Call server action
        setIsComplete(true);
      } catch (error) {
        console.error("Failed to save score:", error);
        // Handle error (e.g., show toast notification)
      } finally {
        setIsSaving(false);
        setShowFeedback(false); // Hide feedback on completion screen
      }
    }
  };

  const getInterpretation = (score: number): string => {
    if (score <= 7) return "Low Openness: You prefer familiarity and routine, valuing safety and practicality over novelty.";
    if (score <= 11) return "Moderate Openness: You balance caution with curiosity, open to new experiences but with a practical mindset.";
    return "High Openness: You thrive on creativity and adventure, eagerly embracing the unknown and seeking new ideas.";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-black p-4 text-white">
       {/* Progress Bar */}
       <div className="w-full max-w-2xl mb-8">
         <Progress value={progressPercent} className="w-full h-2 bg-purple-900/40 [&>*]:bg-gradient-to-r [&>*]:from-pink-500 [&>*]:to-purple-500" />
         <p className="text-center text-sm text-purple-300 mt-2">
           Scenario {isComplete ? scenarios.length : currentScenarioIndex + 1} of {scenarios.length}
         </p>
       </div>

      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.div
            key={currentScenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl rounded-3xl border border-purple-500/20 bg-black/40 p-8 text-center backdrop-blur-md shadow-xl"
          >
            {!showFeedback ? (
              <>
                <p className="mb-6 text-lg text-purple-200">{currentScenario.description}</p>
                <div className="grid grid-cols-1 gap-4">
                  {currentScenario.choices.map((choice, index) => (
                    <Button
                      key={index}
                      onClick={() => handleChoice(choice)}
                      variant="outline"
                      className="justify-start border-purple-500/30 bg-purple-900/20 text-left text-purple-200 hover:border-purple-400/50 hover:bg-purple-800/30 hover:text-white"
                    >
                      {choice.text}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mb-6 text-lg italic text-purple-100">{selectedChoice?.feedback}</p>
                <Button
                  onClick={handleContinue}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-pink-600 to-purple-600"
                >
                  {isSaving ? "Saving..." : "Continue"}
                </Button>
              </motion.div>
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
            <h2 className="mb-4 text-2xl font-bold text-white">Openness Assessment Complete!</h2>
            <p className="mb-2 text-lg text-purple-200">Your total score: {totalScore} / 15</p>
            <p className="mb-6 text-lg font-semibold text-pink-300">{getInterpretation(totalScore)}</p>
            <Button
              onClick={() => router.push('/workshop/dreamscapes/results')} // Navigate to results page
              className="bg-gradient-to-r from-teal-600 to-cyan-600"
            >
              View Full Personality Radar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
