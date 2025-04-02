// Removed unused Link, AuthAwareLinks imports
// Removed server-side auth imports: cookies, createServerClient
import { AIEducationHero } from '@/components/ai-education-hero'
import { Features } from '@/components/ui/features'
import { HowItWorksSection } from '@/components/ui/how-it-works'
// Removed lucide-react icons

// Make the component non-async as auth check is moved to client
export default function Home() {

  // Removed server-side auth check
  // Added comment to trigger rebuild

  return (
    <div className="flex w-full flex-col items-center">
      {/* TODO: Add Optional Navigation Bar */}

      {/* Hero Section - Renders AuthAwareLinks internally */}
      <AIEducationHero />

      {/* Features Section */}
      <section id="features" className="w-full bg-gray-50 dark:bg-gray-900 py-16 lg:py-24">
         <Features
            badge="Key Tools"
            heading="Explore AI Youni's Capabilities"
            subheading="Leverage AI and guided assessments to find your ideal career path."
            features={[
              {
                icon: <span>💬</span>, // Placeholder - Ion-icon removed temporarily
                title: "AI Consultant Chat",
                description: "Get personalized advice and answers to your career questions.",
              },
              {
                icon: <span>📋</span>, // Placeholder - Ion-icon removed temporarily
                title: "In-Depth Assessments",
                description: "Understand your interests, skills, and values.",
              },
              {
                icon: <span>💡</span>, // Placeholder - Ion-icon removed temporarily
                title: "Personalized Results",
                description: "Receive AI-powered analysis and career suggestions.",
              },
            ]}
          />
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-16 lg:py-24">
         <HowItWorksSection />
      </section>

      {/* TODO: Add Footer */}
       <footer className="w-full border-t py-6 text-center text-sm text-gray-500">
         &copy; {new Date().getFullYear()} AI Youni. All rights reserved. {/* <ion-icon name="heart" class="text-red-500 align-middle"></ion-icon> */} {/* Ion-icon removed temporarily */}
       </footer>
    </div>
  );
}
