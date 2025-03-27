
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck } from 'lucide-react';
import { useSignUp } from '@clerk/clerk-react';
import { toast } from 'sonner';

const Signup = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

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
      
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Account created successfully");
        navigate("/dashboard");
      } else {
        console.log("Signup requires further action", result);
        toast.info("Please check your email to verify your account");
      }
    } catch (error: any) {
      console.error("Error during signup:", error);
      toast.error(error.errors?.[0]?.message || "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: "oauth_google" | "oauth_github") => {
    if (!isLoaded) return;
    
    try {
      setIsLoading(true);
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/dashboard',
        redirectUrlComplete: '/dashboard',
      });
    } catch (error) {
      console.error("OAuth error:", error);
      toast.error("Failed to sign up with provider");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-muted/50 to-muted">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center mb-8 text-2xl font-bold">
          WriteGenuine
        </Link>
        
        <Card className="w-full">
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
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    terms of service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    privacy policy
                  </Link>
                </label>
              </div>
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
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck size={16} />
          <span>Your data is secure and encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
