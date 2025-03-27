
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import App from './App.tsx';
import './index.css';

// Initialize Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL || "");

// Get Clerk publishable key from environment variable
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your environment variables.");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider 
    publishableKey={CLERK_PUBLISHABLE_KEY}
    clerkJSVersion="5.56.0-snapshot.v20250312225817"
    signInUrl="/login"
    signUpUrl="/signup"
    signInFallbackRedirectUrl="/dashboard"
    signUpFallbackRedirectUrl="/"
    afterSignOutUrl="/"
  >
    <ConvexProviderWithClerk client={convex}>
      <App />
    </ConvexProviderWithClerk>
  </ClerkProvider>
);
