
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useSignIn } from '@clerk/clerk-react';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';

const Login = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Logged in successfully");
        navigate("/dashboard");
      } else {
        console.error("Login failed", result);
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error: any) {
      console.error("Error during login:", error);
      toast.error(error.errors?.[0]?.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "oauth_google" | "oauth_github") => {
    if (!isLoaded) return;
    
    try {
      setIsLoading(true);
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/dashboard',
        redirectUrlComplete: '/dashboard',
      });
    } catch (error) {
      console.error("OAuth error:", error);
      toast.error("Failed to login with provider");
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
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
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
                onClick={() => handleOAuthSignIn("oauth_google")}
                disabled={isLoading}
              >
                Google
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleOAuthSignIn("oauth_github")}
                disabled={isLoading}
              >
                GitHub
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck size={16} />
          <span>Secure, encrypted connection</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
