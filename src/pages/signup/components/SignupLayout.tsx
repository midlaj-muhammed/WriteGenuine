
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SignupLayoutProps {
  children: React.ReactNode;
}

const SignupLayout: React.FC<SignupLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-muted/50 to-muted">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center mb-8 text-2xl font-bold">
          WriteGenuine
        </Link>
        
        <Card className="w-full">
          {children}
        </Card>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck size={16} />
          <span>Your data is secure and encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default SignupLayout;
