import React from "react";
import { UserPlus, ClipboardCheck, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming this exists

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive?: boolean; // Note: isActive logic might need adjustment based on scroll or state
}

const Step = ({ number, title, description, icon, isActive = false }: StepProps) => {
  return (
    <div className="flex items-center gap-6 md:gap-8">
      <div
        className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border-2",
            isActive
            ? "bg-primary border-primary text-primary-foreground"
            : "bg-muted border-border text-muted-foreground" // Use border color
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-xl md:text-2xl font-semibold">{title}</h3>
        <p className="text-sm md:text-base text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

interface HowItWorksSectionProps {
  className?: string;
  title?: string;
}

export function HowItWorksSection({
  className,
  title = "How It Works",
}: HowItWorksSectionProps) {
  const steps = [
    {
      number: 1,
      title: "Sign Up",
      description: "Create your free account.",
      icon: <UserPlus className="h-5 w-5" />,
    },
    {
      number: 2,
      title: "Take Assessments",
      description: "Complete our guided quizzes and vocational tests.",
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
    {
      number: 3,
      title: "Chat & Explore",
      description: "Interact with your AI consultant and review your results.",
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ];

  // TODO: Implement logic to determine the currently active step if needed
  const currentActiveStepIndex = 0; // Placeholder: always highlight the first step

  return (
    // Removed outer section tag to allow integration into existing section
    <div className={cn("container mx-auto", className)}>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-10 text-center">
          {title}
        </h2>

        <div className="flex flex-col space-y-8 md:space-y-12 max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <Step
              key={index}
              number={step.number}
              title={step.title}
              description={step.description}
              icon={step.icon}
              isActive={index === currentActiveStepIndex} // Use placeholder active state
            />
          ))}
        </div>
      </div>
  );
}
