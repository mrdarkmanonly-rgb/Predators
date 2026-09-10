"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { syncUserWithDatabase } from "@/actions/user/user.actions";

export function useCurrentUser() {
  const { isLoaded, isSignedIn } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    const syncUser = async () => {
      try {
        setLoading(true);

        const result = await syncUserWithDatabase();

        if (!result.success) {
          setError(result.message ?? "User sync failed");
        }
      } catch (error) {
        console.error("USER SYNC ERROR:", error);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn]);

  return {
    loading,
    error,
  };
}
