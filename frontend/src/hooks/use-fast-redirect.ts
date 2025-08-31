import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/utils";
import { UserType } from "@/types";

/**
 * Custom hook for fast role-based redirects
 * This hook provides instant redirects based on user role without API calls
 */
export function useFastRedirect() {
  const { data: session } = useSession();
  const router = useRouter();

  const redirectBasedOnRole = (fallbackUrl = "/auth/login") => {
    if (!session?.user) {
      router.replace(fallbackUrl);
      return;
    }

    const user = session.user as UserType;
    const role = getUserRole(user);
    
    let redirectUrl = fallbackUrl;
    
    switch (role) {
      case "student":
        redirectUrl = "/students";
        break;
      case "teacher":
        redirectUrl = "/dashboard";
        break;
      case "admin":
        redirectUrl = "/admin";
        break;
    }

    // Use replace to avoid adding to browser history
    router.replace(redirectUrl);
  };

  const redirectToRoleHome = () => redirectBasedOnRole("/auth/login");

  return {
    redirectBasedOnRole,
    redirectToRoleHome,
    userRole: session?.user ? getUserRole(session.user as UserType) : null,
  };
}
