
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";

// Define a type for the function reference to avoid TypeScript errors
type FunctionReference<T extends "mutation" | "query"> = string;

export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const createUser = useMutation(api.users.createUser as FunctionReference<"mutation">);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const userData = useQuery(
    api.users.getUserByClerkId as FunctionReference<"query">,
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
