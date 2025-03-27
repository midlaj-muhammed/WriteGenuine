
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-10",
        isScrolled ? "py-4 glassmorphism" : "py-6 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-2xl font-bold text-foreground tracking-tight"
        >
          WriteGenuine
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/#features">Features</NavLink>
          <NavLink to="/#pricing">Pricing</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4 px-6 flex flex-col gap-4 animate-slide-in-right">
          <MobileNavLink to="/#features" onClick={() => setIsMobileMenuOpen(false)}>Features</MobileNavLink>
          <MobileNavLink to="/#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</MobileNavLink>
          <MobileNavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</MobileNavLink>
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="outline" asChild className="w-full">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
            </Button>
            <Button asChild className="w-full">
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign up</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
  <Link 
    to={to} 
    className="text-foreground/80 hover:text-foreground transition-colors font-medium"
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, children, onClick }: { to: string, children: React.ReactNode, onClick?: () => void }) => (
  <Link 
    to={to} 
    className="text-foreground/80 hover:text-foreground transition-colors py-2 text-lg font-medium"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navigation;
