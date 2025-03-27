
import React from 'react';
import { Button } from '@/components/ui/button';
import { useSignUp } from '@clerk/clerk-react';
import { toast } from 'sonner';

interface OAuthButtonsProps {
  isLoading: boolean;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ isLoading }) => {
  const { isLoaded, signUp } = useSignUp();

  const handleOAuthSignUp = async (provider: "oauth_google" | "oauth_github") => {
    if (!isLoaded) return;
    
    try {
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/dashboard',
        redirectUrlComplete: '/dashboard',
      });
    } catch (error) {
      console.error("OAuth error:", error);
      toast.error("Failed to sign up with provider");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => handleOAuthSignUp("oauth_google")}
        disabled={isLoading}
      >
        Google
      </Button>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => handleOAuthSignUp("oauth_github")}
        disabled={isLoading}
      >
        GitHub
      </Button>
    </div>
  );
};

export default OAuthButtons;
