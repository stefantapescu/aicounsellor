"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // Re-add Button import
import Link from "next/link";
import { Circle } from "lucide-react";
import { AuthAwareLinks } from "@/app/AuthAwareLinks"; // Import the link component

// Helper component for animated shiny text effect
const AnimatedShinyText = ({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-500",
        className
      )}
    >
      {children}
    </span>
  );
};

// Helper component for the animated background pattern
const AnimatedGridPattern = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-blue-500/[0.05] blur-3xl"
      />

      {/* Elegant shapes */}
      <motion.div
        initial={{
          opacity: 0,
          y: -150,
          rotate: -15,
        }}
        animate={{
          opacity: 1,
          y: 0,
          rotate: 12,
        }}
        transition={{
          duration: 2.4,
          delay: 0.3,
          ease: [0.23, 0.86, 0.39, 0.96],
        }}
        className="absolute left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
      >
        <motion.div
          animate={{
            y: [0, 15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          style={{
            width: 600,
            height: 140,
          }}
          className="relative"
        >
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              "bg-gradient-to-r from-indigo-500/[0.15] to-transparent",
              "backdrop-blur-[2px] border-2 border-white/[0.15]",
              "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
              "after:absolute after:inset-0 after:rounded-full",
              "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
            )}
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: -150,
          rotate: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
          rotate: -15,
        }}
        transition={{
          duration: 2.4,
          delay: 0.5,
          ease: [0.23, 0.86, 0.39, 0.96],
        }}
        className="absolute right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
      >
        <motion.div
          animate={{
            y: [0, 15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          style={{
            width: 500,
            height: 120,
          }}
          className="relative"
        >
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              "bg-gradient-to-r from-blue-500/[0.15] to-transparent",
              "backdrop-blur-[2px] border-2 border-white/[0.15]",
              "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
              "after:absolute after:inset-0 after:rounded-full",
              "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
            )}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

// Main Hero Component
// Removed user prop as it's no longer needed here
export function AIEducationHero() {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  // Removed button link logic

  return (
    // Adjusted min-height and padding for integration
    <div className="relative w-full flex items-center justify-center overflow-hidden bg-background py-20 lg:py-32">
      <AnimatedGridPattern />

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/[0.03] border border-border mb-8 md:mb-12"
          >
            <Circle className="h-2 w-2 fill-blue-500/80" />
            <span className="text-sm text-foreground/60 tracking-wide">
              AI Educational Consultant
            </span>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 md:mb-8 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80">
                Discover Your Future with
              </span>
              <br />
              <AnimatedShinyText>
                Your AI Educational Consultant
              </AnimatedShinyText>
            </h1>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-base sm:text-lg md:text-xl text-foreground/60 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
              Navigate career paths, understand your strengths, and get personalized guidance with AI Youni.
            </p>
          </motion.div>

          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-4 mt-8" // Adjusted layout for links
          >
            {/* Render the AuthAwareLinks component here */}
            <AuthAwareLinks />
            {/* Optional: Add back Learn More button if needed, styled differently */}
             <Button size="lg" variant="outline" asChild>
               <Link href="#features">Learn More</Link>
             </Button>
          </motion.div>
        </div>
      </div>

      {/* Removed extra gradient overlay as it might conflict with section background */}
      {/* <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none" /> */}
    </div>
  );
}
