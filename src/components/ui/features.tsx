import * as React from "react"; // Added import
import { MessageCircle, ClipboardList, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Assuming this will be added
import { cn } from "@/lib/utils"; // Assuming this exists

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeaturesProps {
  badge?: string;
  heading?: string;
  subheading?: string;
  features?: FeatureProps[];
}

export function Features({
  badge = "Features",
  heading = "Discover what we offer",
  subheading = "Explore our powerful tools designed to help you make better career decisions.",
  features = [
    {
      icon: <MessageCircle className="h-auto w-5" />,
      title: "AI Consultant Chat",
      description: "Get personalized advice and answers to your career questions.",
    },
    {
      icon: <ClipboardList className="h-auto w-5" />,
      title: "In-Depth Assessments",
      description: "Understand your interests, skills, and values.",
    },
    {
      icon: <Lightbulb className="h-auto w-5" />,
      title: "Personalized Results",
      description: "Receive AI-powered analysis and career suggestions.",
    },
  ],
}: FeaturesProps) {
  return (
    // Removed outer div to allow integration into existing section tag
    <div className="container mx-auto">
      <div className="flex flex-col gap-10">
        <div className="flex gap-4 flex-col items-center text-center">
          <div>
            <Badge>{badge}</Badge>
          </div>
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-4xl tracking-tighter font-semibold">
              {heading}
            </h2>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed text-muted-foreground">
              {subheading}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 p-6 rounded-xl border bg-card text-card-foreground" // Use card colors
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
