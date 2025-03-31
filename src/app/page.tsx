// import { AIEducationHero } from '@/components/ai-education-hero'
// import { Features } from '@/components/ui/features'
// import { HowItWorksSection } from '@/components/ui/how-it-works'
// import { MessageCircle, ClipboardList, Lightbulb } from "lucide-react";

// Make the component non-async as auth check is moved to client
export default function Home() {
  // Return a minimal page to test deployment
  return (
    <div>
      <h1>Test Page</h1>
      <p>If you see this, the basic deployment works.</p>
    </div>
  );

  /*
  // Original content commented out
  return (
    <div className="flex w-full flex-col items-center">
      <AIEducationHero />
      <section id="features" className="w-full bg-gray-50 dark:bg-gray-900 py-16 lg:py-24">
         <Features
            badge="Key Tools"
            heading="Explore AI Youni's Capabilities"
            subheading="Leverage AI and guided assessments to find your ideal career path."
            features={[
              {
                icon: <MessageCircle className="h-auto w-6" />,
                title: "AI Consultant Chat",
                description: "Get personalized advice and answers to your career questions.",
              },
              {
                icon: <ClipboardList className="h-auto w-6" />,
                title: "In-Depth Assessments",
                description: "Understand your interests, skills, and values.",
              },
              {
                icon: <Lightbulb className="h-auto w-6" />,
                title: "Personalized Results",
                description: "Receive AI-powered analysis and career suggestions.",
              },
            ]}
          />
      </section>
      <section id="how-it-works" className="w-full py-16 lg:py-24">
         <HowItWorksSection />
      </section>
       <footer className="w-full border-t py-6 text-center text-sm text-gray-500">
         &copy; {new Date().getFullYear()} AI Youni. All rights reserved.
       </footer>
    </div>
  );
  */
}
