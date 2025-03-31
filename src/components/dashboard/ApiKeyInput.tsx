
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ApiKeyInputProps {
  onSubmit: (key: string) => void;
}

const ApiKeyInput = ({ onSubmit }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-lg">API Key Required</CardTitle>
        <CardDescription>
          Please enter your Google Generative AI API key to use this feature
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Input 
            type="password" 
            placeholder="Enter API key..." 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1"
          />
          <Button onClick={() => onSubmit(apiKey)} disabled={!apiKey.trim()}>
            Save Key
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Your API key will only be stored in your browser's local storage.
        </p>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;
