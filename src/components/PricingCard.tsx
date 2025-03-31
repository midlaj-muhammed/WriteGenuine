
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText?: string;
}

const PricingCard = ({
  title,
  price,
  description,
  features,
  popular = false,
  buttonText = "Get Started"
}: PricingCardProps) => {
  return (
    <div 
      className={cn(
        "border rounded-2xl p-8 transition-all duration-300 relative",
        popular ? 
          "border-primary shadow-lg shadow-primary/10 scale-105 z-10" : 
          "border-border hover:shadow-lg hover:translate-y-[-4px]"
      )}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </div>
      )}
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        {price !== "Free" && <span className="text-muted-foreground ml-1">/month</span>}
      </div>
      
      <p className="text-muted-foreground mb-6">{description}</p>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check size={18} className="text-primary mt-0.5 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        className={cn("w-full", 
          popular ? "bg-primary hover:bg-primary/90" : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
        )}
        variant={popular ? "default" : "secondary"}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default PricingCard;
