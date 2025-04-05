import { useSession } from "next-auth/react";
import { UserType } from "@/types";
import { useState, useEffect } from "react";

/**
 * A hook to access the current authenticated user information
 * @returns Object containing user data and loading state
 */
export function useUser() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Cast the session user to our UserType
      setUser(session.user as unknown as UserType);
    }
    setLoading(status === "loading");
  }, [session, status]);

  return {
    user,
    isLoading: loading,
    isAuthenticated: status === "authenticated",
  };
}
