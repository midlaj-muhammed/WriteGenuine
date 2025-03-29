import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { useSignUp } from '@clerk/clerk-react';
import { toast } from 'sonner';
import OAuthButtons from './OAuthButtons';
import TermsCheckbox from './TermsCheckbox';

const SignupForm = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      await signUp.prepareEmailAddressVerification();
      toast.success("Verification code sent. Please check your email.");
      setVerificationSent(true);
    } catch (error: any) {
      console.error("Error resending verification:", error);
      toast.error("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded || !termsAccepted) {
      if (!termsAccepted) {
        toast.error("Please accept the terms of service");
      }
      return;
    }

    try {
      setIsLoading(true);
      
      // First create the signup
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });

      console.log("Signup result:", result);

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Account created successfully");
        navigate("/dashboard");
      } else if (result.status === "missing_requirements") {
        // Handle email verification
        const emailVerification = result.verifications.emailAddress;
        console.log("Email verification status:", emailVerification);

        if (emailVerification) {
          // Prepare verification
          await signUp.prepareEmailAddressVerification();
          
          toast.info(
            <div className="space-y-2">
              <p>Please check your email for a verification code.</p>
              <p className="text-sm">Email: {email}</p>
              <p className="text-sm">Check your spam folder if you don't see it.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResendVerification}
                disabled={isLoading}
                className="mt-2"
              >
                Resend verification code
              </Button>
            </div>,
            { duration: 15000 }
          );
        } else {
          console.log("Missing verification requirements:", result.verifications);
          toast.error("Unable to start verification process. Please try again.");
        }
      } else {
        console.log("Unexpected signup status:", result.status);
        toast.error("An unexpected error occurred. Please try again.");
      }
    } catch (error: any) {
      console.error("Error during signup:", error);
      
      // Log the full error for debugging
      console.log("Full error object:", error);
      
      if (error.errors && error.errors.length > 0) {
        const errorMessage = error.errors[0].message;
        console.log("Error message:", errorMessage);
        
        if (errorMessage.includes("email")) {
          toast.error("Please enter a valid email address");
        } else if (errorMessage.includes("password")) {
          toast.error("Password must be at least 8 characters long");
        } else if (errorMessage.includes("already exists")) {
          toast.error("An account with this email already exists");
        } else if (errorMessage.includes("verification")) {
          toast.error("There was an issue with email verification. Please try again.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("An error occurred during signup. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create an account</CardTitle>
        <CardDescription className="text-center">
          Enter your information to get started with WriteGenuine
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input 
                id="firstName" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input 
                id="lastName" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <TermsCheckbox 
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            disabled={isLoading}
          />
          
          <Button className="w-full" type="submit" disabled={isLoading || !termsAccepted}>
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or continue with</span>
          </div>
        </div>
        
        <OAuthButtons isLoading={isLoading} />
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </div>
      </CardFooter>
    </>
  );
};

export default SignupForm;
