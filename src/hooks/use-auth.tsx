
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";

export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  
  // TODO: Fix Convex API types when generated types are properly configured
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createUser = useMutation(api.users.createUser as any);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userData = useQuery(
    api.users.getUserByClerkId as any,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // When a user logs in with Clerk, create or update their record in Convex
  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && user && !isInitialized) {
        try {
          // Use Promise.race to timeout user creation if it takes too long
          const userCreationPromise = createUser({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
          });
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('User creation timeout')), 5000)
          );

          await Promise.race([userCreationPromise, timeoutPromise]);
          setIsInitialized(true);
        } catch (error) {
          console.error("Failed to sync user with Convex:", error);
          // Mark as initialized even if creation fails to prevent infinite retries
          // The createUser mutation handles duplicate users gracefully
          setIsInitialized(true);
        }
      }
    };

    // Immediate execution for faster response
    if (isAuthenticated && user && !isInitialized) {
      syncUser();
    }
  }, [isAuthenticated, user, createUser, isInitialized]);

  return {
    isLoading: isLoading || (isAuthenticated && !userData && !isInitialized),
    isAuthenticated,
    user,
    subscription: userData?.subscription,
    userData,
  };
}
