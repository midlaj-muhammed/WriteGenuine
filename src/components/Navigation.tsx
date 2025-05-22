import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignedIn, SignedOut, UserButton, useClerk } from '@clerk/clerk-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useClerk();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Handle hash links and scroll to the corresponding section
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const handleSignOut = () => {
    signOut();
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 md:px-10",
        isScrolled ? "py-3 glassmorphism" : "py-4 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2"
        >
          <img src="/logo.svg" alt="WriteGenuine Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
          <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">WriteGenuine</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <NavLink to="/" onClick={() => scrollToSection('features')}>Features</NavLink>
          <NavLink to="/" onClick={() => scrollToSection('pricing')}>Pricing</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>

          <SignedIn>
            <div className="flex items-center gap-4">
              <UserButton afterSignOutUrl="/" />
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          </SignedOut>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "md:hidden fixed inset-0 bg-background/95 backdrop-blur-sm z-40 transition-all duration-300",
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        style={{ top: isMobileMenuOpen ? '4rem' : '-100%' }}
      >
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center gap-2 py-2 border-b border-border mb-4">
            <img src="/logo.svg" alt="WriteGenuine Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-foreground tracking-tight">WriteGenuine</span>
          </div>
          
          <div className="space-y-4">
            <MobileNavLink
              to="/"
              onClick={() => {
                setIsMobileMenuOpen(false);
                scrollToSection('features');
              }}
            >
              Features
            </MobileNavLink>
            <MobileNavLink
              to="/"
              onClick={() => {
                setIsMobileMenuOpen(false);
                scrollToSection('pricing');
              }}
            >
              Pricing
            </MobileNavLink>
            <MobileNavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
              Dashboard
            </MobileNavLink>
          </div>

          <SignedIn>
            <div className="flex flex-col gap-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <UserButton afterSignOutUrl="/" />
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex flex-col gap-3 pt-4 border-t border-border">
              <Button variant="outline" asChild className="w-full">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign up</Link>
              </Button>
            </div>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, onClick }: { to: string, children: React.ReactNode, onClick?: () => void }) => (
  <Link
    to={to}
    className="text-foreground/80 hover:text-foreground transition-colors font-medium"
    onClick={onClick}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, children, onClick }: { to: string, children: React.ReactNode, onClick?: () => void }) => (
  <Link
    to={to}
    className="text-foreground/80 hover:text-foreground transition-colors py-2 text-lg font-medium block"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navigation;
