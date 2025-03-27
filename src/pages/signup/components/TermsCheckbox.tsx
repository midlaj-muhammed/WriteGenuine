
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ 
  checked, 
  onCheckedChange, 
  disabled 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="terms" 
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
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
  );
};

export default TermsCheckbox;
