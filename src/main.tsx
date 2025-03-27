
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import App from './App.tsx';
import './index.css';

// Initialize Convex client with a default URL if the environment variable is not available
const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  console.warn("VITE_CONVEX_URL is not set. Running in development mode with mock data.");
}

// Initialize Convex client - ensuring we always provide a valid URL even for development fallback
const convex = new ConvexReactClient(convexUrl || "https://noop.convex.cloud");

// Get Clerk publishable key from environment variable
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// In development, provide a mock key if none is available
const isDevelopment = import.meta.env.DEV;
const publishableKey = CLERK_PUBLISHABLE_KEY || (isDevelopment ? 'pk_test_mock-key-for-development' : null);

if (!publishableKey) {
  throw new Error("Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your environment variables.");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider 
    publishableKey={publishableKey}
    clerkJSVersion="5.56.0-snapshot.v20250312225817"
    signInUrl="/login"
    signUpUrl="/signup"
    signInFallbackRedirectUrl="/dashboard"
    signUpFallbackRedirectUrl="/"
    afterSignOutUrl="/"
  >
    <ConvexProviderWithClerk 
      client={convex} 
      useAuth={() => ({ 
        isAuthenticated: false,
        isLoaded: true,
        isSignedIn: false,
        getToken: async () => "",
        orgId: "",
        orgRole: ""
      })}
    >
      <App />
    </ConvexProviderWithClerk>
  </ClerkProvider>
);
