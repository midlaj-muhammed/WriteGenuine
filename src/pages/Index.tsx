
import React, { useEffect } from 'react';
import { ArrowRight, ShieldCheck, Bot, RefreshCw, Check, FileText, BarChart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FeatureCard from '@/components/FeatureCard';
import PricingCard from '@/components/PricingCard';
import FeatureShowcase from '@/components/FeatureShowcase';
import { Link } from 'react-router-dom';

const Index = () => {
  useEffect(() => {
    // Animation on scroll
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOnScroll = () => {
      for (let i = 0; i < revealElements.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = revealElements[i].getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
          revealElements[i].classList.add('active');
        }
      }
    };
    
    window.addEventListener('scroll', revealOnScroll);
    // Initial check
    revealOnScroll();
    
    return () => window.removeEventListener('scroll', revealOnScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-brand-lightGray px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-fade-in">
            <span>Introducing WriteGenuine</span>
            <div className="w-1 h-1 rounded-full bg-foreground/30"></div>
            <span className="text-primary">Content Authenticity Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 mx-auto max-w-4xl animate-slide-up">
            Ensure Your Content is <span className="text-primary">100% Authentic</span> and <span className="text-primary">Original</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Powerful tools for plagiarism checking, AI detection, and AI humanization. 
            Create genuine, high-quality content with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button size="lg" asChild>
              <Link to="/signup" className="gap-2">
                Get Started <ArrowRight size={16} />
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>
      
      {/* Main Application Preview */}
      <section className="py-16 px-6 bg-brand-lightGray">
        <div className="max-w-6xl mx-auto relative reveal">
          <div className="w-full h-[500px] md:h-[600px] bg-gray-200 rounded-2xl overflow-hidden shadow-2xl">
            {/* This would be a screenshot or demo video of the application */}
            <div className="w-full h-full bg-gradient-to-br from-primary/80 via-primary to-blue-500 flex items-center justify-center text-white">
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Application Preview</h3>
                <p className="text-white/80 mb-6">Interactive demo of WriteGenuine in action</p>
                <Button variant="secondary" size="lg">
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Core Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16 reveal">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Core Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Everything You Need for Content Authenticity
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced tools to check, detect, and optimize your content to ensure it's 
            authentic, original, and perfectly balanced.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 reveal stagger-animation">
          <FeatureCard 
            title="Plagiarism Checker" 
            description="Detect copied content by comparing text against billions of web sources, academic papers, and publications."
            icon={<ShieldCheck className="text-primary" size={24} />}
          />
          <FeatureCard 
            title="AI Detection" 
            description="Analyze text to determine whether it was written by a human or generated by AI, with detailed confidence metrics."
            icon={<Bot className="text-primary" size={24} />}
          />
          <FeatureCard 
            title="AI Humanizer" 
            description="Transform AI-generated content into natural human writing that bypasses detection tools while maintaining quality."
            icon={<RefreshCw className="text-primary" size={24} />}
          />
        </div>
      </section>
      
      {/* Feature Showcase */}
      <section className="py-20 px-6 bg-brand-lightGray reveal">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            How It Works
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Powerful Tools in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how our suite of tools can help you create authentic, high-quality content.
          </p>
        </div>
        
        <FeatureShowcase />
      </section>
      
      {/* Secondary Features */}
      <section className="py-20 px-6 reveal">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                Advanced Features
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Go Beyond Basic Checks
              </h2>
              <p className="text-xl text-muted-foreground mb-10">
                WriteGenuine offers additional features to enhance your content creation workflow
                and ensure the highest quality output.
              </p>
              
              <div className="space-y-6">
                <AdvancedFeature 
                  icon={<FileText size={20} />}
                  title="Detailed Reports"
                  description="Get comprehensive reports with visual highlights, similarity percentage, and source links."
                />
                <AdvancedFeature 
                  icon={<BarChart size={20} />}
                  title="Analytics Dashboard"
                  description="Track content quality trends and patterns over time with visual analytics."
                />
                <AdvancedFeature 
                  icon={<Zap size={20} />}
                  title="Real-time Suggestions"
                  description="Receive instant feedback and improvement suggestions as you write."
                />
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-2xl overflow-hidden h-[500px] relative">
              {/* Advanced features illustration/screenshot */}
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <div className="w-4/5 aspect-video bg-white rounded-lg shadow-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Advanced Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-brand-lightGray reveal">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Pricing
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for your needs. All plans include core features with 
            varying usage limits and capabilities.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 stagger-animation">
          <PricingCard 
            title="Basic"
            price="Free"
            description="Perfect for occasional use and individual projects."
            features={[
              "Plagiarism check (1,000 words/month)",
              "Basic AI detection",
              "Limited AI humanization",
              "Standard support",
              "1 project"
            ]}
            buttonText="Sign Up Free"
          />
          
          <PricingCard 
            title="Professional"
            price="$19"
            description="Ideal for individuals who need regular content verification."
            features={[
              "Plagiarism check (10,000 words/month)",
              "Advanced AI detection",
              "Full AI humanization",
              "Priority support",
              "5 projects",
              "Detailed reports & analytics"
            ]}
            popular={true}
          />
          
          <PricingCard 
            title="Enterprise"
            price="$49"
            description="For teams and businesses with high-volume content needs."
            features={[
              "Plagiarism check (50,000 words/month)",
              "Advanced AI detection with custom tuning",
              "Premium AI humanization",
              "24/7 priority support",
              "Unlimited projects",
              "Advanced reports & API access",
              "Team collaboration tools"
            ]}
            buttonText="Contact Sales"
          />
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 px-6 reveal">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-10 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Ready to Ensure Your Content's Authenticity?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of writers, students, and businesses who trust WriteGenuine for 
            authentic, high-quality content.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/signup" className="gap-2">
              Get Started Now <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

const AdvancedFeature = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <div className="text-primary">{icon}</div>
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default Index;
