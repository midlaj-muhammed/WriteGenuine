
import { createRoot } from 'react-dom/client';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
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

// Get Clerk publishable key from environment variables - support both VITE_ and NEXT_PUBLIC_ prefixes
const CLERK_PUBLISHABLE_KEY = 
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
  "pk_test_aW1tdW5lLXBlcmNoLTU0LmNsZXJrLmFjY291bnRzLmRldiQ"; // Fallback to the provided key

// We need to provide a valid publishable key for Clerk
if (!CLERK_PUBLISHABLE_KEY) {
  // Instead of throwing an error, render a more user-friendly message
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; color: #1a202c; padding: 2rem;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">Missing Clerk Publishable Key</h1>
        <p style="font-size: 1.2rem; max-width: 600px; text-align: center; margin-bottom: 1.5rem;">
          Please add VITE_CLERK_PUBLISHABLE_KEY to your environment variables.
          You can get your key from the <a href="https://dashboard.clerk.com/last-active?path=api-keys" style="color: #3182ce;">Clerk Dashboard</a>.
        </p>
        <div style="background-color: #f7fafc; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; max-width: 600px;">
          <p style="margin: 0; font-family: monospace;">VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</p>
        </div>
      </div>
    `;
  }
  throw new Error("Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your environment variables.");
}

// Render the application with the valid Clerk key
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
    <ConvexProviderWithClerk 
      client={convex} 
      useAuth={useAuth}
    >
      <App />
    </ConvexProviderWithClerk>
  </ClerkProvider>
);
