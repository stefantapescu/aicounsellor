'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'; // Import User type

export function AuthAwareLinks() {
  // Use the imported User type, allowing null
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes (optional but good practice)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    // Optional: Render a loading state for the buttons
    return <div className="mt-4 h-10 w-48 animate-pulse rounded-md bg-gray-300"></div>;
  }

  return (
    <div className="mt-4 flex gap-4">
      {user ? (
         <>
           {/* <p className="text-md text-gray-700 self-center">Logged in</p> */}
           <Button size="lg" asChild>
             <Link href="/dashboard">Go to Dashboard</Link>
           </Button>
           {/* Optionally add logout button here too */}
         </>
      ) : (
        <>
          <Button size="lg" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </>
      )}
    </div>
  );
}
