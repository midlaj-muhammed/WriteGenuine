import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const SSOCallback = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<'loading' | 'creating' | 'success' | 'error'>('loading');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createUser = useMutation(api.users.createUser as any);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (!isLoaded) return;

      if (isSignedIn && user) {
        setStatus('creating');
        
        // Start user creation and navigation in parallel
        const userCreationPromise = createUser({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
        }).catch(error => {
          console.error("Error creating user in Convex:", error);
          // Don't throw - we'll handle this gracefully
        });

        // Set a minimum delay for better UX (prevents flash)
        const minDelayPromise = new Promise(resolve => setTimeout(resolve, 800));

        try {
          // Wait for both user creation and minimum delay
          await Promise.all([userCreationPromise, minDelayPromise]);
          
          setStatus('success');
          toast.success("Welcome back! Redirecting to your dashboard...");
          
          // Small delay to show success state
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 300);
          
        } catch (error: any) {
          console.error("OAuth callback error:", error);
          
          // Check if this is a duplicate user scenario
          if (error?.message?.includes('already exists') || 
              error?.message?.includes('duplicate')) {
            setStatus('success');
            toast.success("Welcome back! Redirecting to your dashboard...");
            setTimeout(() => {
              navigate("/dashboard", { replace: true });
            }, 300);
          } else {
            setStatus('error');
            // Still navigate to dashboard - useAuth hook will retry user creation
            setTimeout(() => {
              navigate("/dashboard", { replace: true });
            }, 1000);
          }
        }
      } else {
        // If not signed in, redirect to signup
        navigate("/signup", { replace: true });
      }
    };

    handleOAuthCallback();
  }, [isLoaded, isSignedIn, user, createUser, navigate]);

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />,
          title: "Authenticating...",
          description: "Verifying your account with the provider"
        };
      case 'creating':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />,
          title: "Setting up your account...",
          description: "Creating your profile and workspace"
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-8 w-8 mx-auto mb-4 text-green-600" />,
          title: "Welcome to WriteGenuine!",
          description: "Redirecting to your dashboard..."
        };
      case 'error':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />,
          title: "Finalizing setup...",
          description: "Almost ready, just a moment more"
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-md mx-auto p-6">
        {content.icon}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{content.title}</h2>
        <p className="text-gray-600 mb-4">{content.description}</p>
        
        {/* Progress indicator */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className={`bg-blue-600 h-2 rounded-full transition-all duration-1000 ${
              status === 'loading' ? 'w-1/4' : 
              status === 'creating' ? 'w-3/4' : 
              status === 'success' ? 'w-full' : 'w-2/3'
            }`}
          />
        </div>
        
        <p className="text-sm text-gray-500">
          This usually takes just a few seconds
        </p>
      </div>
    </div>
  );
};

export default SSOCallback;
