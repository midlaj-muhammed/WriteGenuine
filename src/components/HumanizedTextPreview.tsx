import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { humanizeText } from '@/services/freeAIService';

const HumanizedTextPreview = () => {
  const [inputText, setInputText] = useState('');
  const [humanizedText, setHumanizedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [style, setStyle] = useState('natural');

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to humanize');
      return;
    }

    setIsLoading(true);
    try {
      const result = await humanizeText(inputText, style);
      setHumanizedText(result);
      toast.success('Text humanized successfully!');
    } catch (error) {
      console.error('Error humanizing text:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      
      toast.error('Failed to humanize text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-primary">AI Text Humanizer</h3>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-muted-foreground">Free Humanizer Tool</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Style Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Writing Style</label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Select writing style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="natural">Natural & Balanced</SelectItem>
              <SelectItem value="casual">Casual & Conversational</SelectItem>
              <SelectItem value="professional">Professional & Formal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Input Section */}
        <div>
          <label className="block text-sm font-medium mb-2">Original Text</label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter the text you want to humanize..."
            className="min-h-[100px]"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleHumanize}
            disabled={isLoading || !inputText.trim()}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Humanizing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Humanize Text
              </>
            )}
          </Button>
        </div>

        {/* Output Section */}
        {humanizedText && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Humanized Text</label>
              <div className="flex items-center text-sm text-green-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Humanized</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{humanizedText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HumanizedTextPreview; 