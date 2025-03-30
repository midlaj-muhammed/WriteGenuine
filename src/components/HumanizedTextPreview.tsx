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

const HumanizedTextPreview = () => {
  const [inputText, setInputText] = useState('');
  const [humanizedText, setHumanizedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [style, setStyle] = useState('natural');

  const getSystemPrompt = (style: string) => {
    const prompts = {
      natural: `You are an expert content humanizer. Your task is to make the given text sound more natural and human-like while maintaining its meaning. Follow these guidelines:
1. Use natural transitions between ideas
2. Vary sentence structure and length
3. Add appropriate conjunctions and connecting words
4. Use active voice where possible
5. Include natural pauses and rhythm
6. Maintain the original meaning and key points
7. Add subtle emotional undertones
8. Use conversational language where appropriate
9. Avoid repetitive patterns
10. Keep the tone professional but engaging`,
      
      casual: `You are an expert content humanizer specializing in casual, conversational writing. Your task is to make the given text sound more natural and engaging. Follow these guidelines:
1. Use everyday language and expressions
2. Add personal touches and relatable examples
3. Include conversational transitions
4. Use contractions naturally
5. Add friendly, approachable tone
6. Keep sentences shorter and more direct
7. Use active voice
8. Include natural pauses and rhythm
9. Add subtle humor where appropriate
10. Maintain the original message while making it more engaging`,
      
      professional: `You are an expert content humanizer specializing in professional writing. Your task is to make the given text sound more polished and business-appropriate. Follow these guidelines:
1. Use clear, concise language
2. Maintain formal tone while being engaging
3. Use professional transitions
4. Include industry-appropriate terminology
5. Structure ideas logically
6. Use active voice
7. Add appropriate emphasis on key points
8. Maintain professional rhythm
9. Include relevant examples
10. Keep the tone authoritative but approachable`
    };
    return prompts[style as keyof typeof prompts] || prompts.natural;
  };

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to humanize');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: getSystemPrompt(style)
            },
            {
              role: "user",
              content: inputText
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to humanize text');
      }

      const data = await response.json();
      setHumanizedText(data.choices[0].message.content);
      toast.success('Text humanized successfully!');
    } catch (error) {
      console.error('Error humanizing text:', error);
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
            <span className="text-sm text-muted-foreground">Powered by WriteGenuine</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
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