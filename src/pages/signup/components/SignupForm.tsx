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
  const [code, setCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const handleResendVerification = async () => {
    if (!signUp) return;
    try {
      setIsLoading(true);
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      toast.success("Verification code sent. Please check your email (including spam folder).");
    } catch (error: unknown) {
      console.error("Error resending verification:", error);
      toast.error("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp || !code.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    try {
      setIsLoading(true);
      
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      
      if (completeSignUp.status !== "complete") {
        console.log("Verification response:", completeSignUp);
        toast.error("Verification failed. Please try again.");
        return;
      }
      
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        toast.success("Account verified successfully!");
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      console.error("Error during verification:", error);
      const errorMessage = (error as { errors?: Array<{ message: string }> })?.errors?.[0]?.message || "Failed to verify email";
      toast.error(errorMessage);
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

    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      
      // Start the sign-up process
      const signUpAttempt = await signUp.create({
        emailAddress: email,
        password,
      });

      // After sign up, prepare email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      
      // Show verification UI
      setShowVerification(true);
      setPendingVerification(true);
      
      toast.info(
        <div className="space-y-2">
          <p>Please check your email for a verification code.</p>
          <p className="text-sm">Email: {email}</p>
          <p className="text-sm">Check your spam folder if you don't see it.</p>
        </div>,
        { duration: 15000 }
      );

    } catch (error: unknown) {
      console.error("Error during signup:", error);
      
      const typedError = error as { errors?: Array<{ message: string }> };
      if (typedError.errors && typedError.errors.length > 0) {
        const errorMessage = typedError.errors[0].message;
        
        if (errorMessage.includes("email")) {
          toast.error("Please enter a valid email address");
        } else if (errorMessage.includes("password")) {
          toast.error("Password must be at least 8 characters long");
        } else if (errorMessage.includes("already exists") || errorMessage.includes("identifier_already_exists")) {
          toast.error("Account already exists! Please use the login page instead.", {
            action: {
              label: "Go to Login",
              onClick: () => window.location.href = "/login"
            }
          });
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
        {!showVerification ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input 
                  id="firstName" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input 
                  id="lastName" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
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
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
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
        ) : (
          <form onSubmit={handleVerification} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">Verify your email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a verification code to {email}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input 
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter verification code"
                disabled={isLoading}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendVerification}
              disabled={isLoading}
            >
              Resend Code
            </Button>
          </form>
        )}
        
        {!showVerification && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or continue with</span>
              </div>
            </div>
            
            <OAuthButtons isLoading={isLoading} />
          </>
        )}
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
