
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";

// Define the correct type for Convex function references
// This is a workaround for development mode with auto-generated types
type ConvexFunction = any; // This allows us to bypass TypeScript checking during development

export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  
  // Cast the string to any to bypass TypeScript checking during development
  const createUser = useMutation(api.users.createUser as ConvexFunction);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const userData = useQuery(
    api.users.getUserByClerkId as ConvexFunction,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // When a user logs in with Clerk, create or update their record in Convex
  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && user && !isInitialized) {
        try {
          await createUser({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
          });
          setIsInitialized(true);
        } catch (error) {
          console.error("Failed to sync user with Convex:", error);
        }
      }
    };

    syncUser();
  }, [isAuthenticated, user, createUser, isInitialized]);

  return {
    isLoading: isLoading || (isAuthenticated && !userData && !isInitialized),
    isAuthenticated,
    user,
    subscription: userData?.subscription,
    userData,
  };
}
