import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RoboYouniMascot from '@/components/RoboYouniMascot'; // Import the mascot component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Youni V2", // Updated title
  description: "AI Educational Consultant", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Add mascot fixed at bottom-right */}
        <div className="fixed bottom-4 right-4 z-50 opacity-80 hover:opacity-100 transition-opacity">
          <RoboYouniMascot width={80} height={80} />
        </div>
        <main className="min-h-screen flex flex-col items-center w-full"> {/* Added w-full */}
          {children}
        </main>
      </body>
    </html>
  );
}
