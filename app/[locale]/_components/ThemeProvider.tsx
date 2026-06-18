"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    const fetchThemePreference = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Here we could fetch the theme from a user_preferences table
        const { data } = await supabase
          .from("user_preferences")
          .select("theme")
          .eq("user_id", session.user.id)
          .single();

        if (data?.theme) {
          // If we have a theme from the DB, we might want to apply it
          // next-themes normally uses localStorage, so we might sync DB to localStorage
          // Or just let next-themes handle it and we update DB on change
          const currentLocalTheme = localStorage.getItem("theme");
          if (data.theme !== currentLocalTheme) {
             localStorage.setItem("theme", data.theme);
             // Quick reload or force update next-themes if needed
          }
        }
      }
    };
    
    fetchThemePreference();
  }, [supabase.auth]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
