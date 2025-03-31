
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, Info, FileText, Bot } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface HumanizeResultProps {
  results: {
    originalText: string;
    humanizedText: string;
    humanScore: number;
  };
}

const HumanizeResults = ({ results }: HumanizeResultProps) => {
  const [copied, setCopied] = useState({
    original: false,
    humanized: false
  });

  const handleCopy = (type: 'original' | 'humanized') => {
    const textToCopy = type === 'original' ? results.originalText : results.humanizedText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(prev => ({ ...prev, [type]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [type]: false })), 2000);
  };

  return (
    <div className="mt-8 space-y-6 animate-fade-in">
      <div className="p-4 border border-green-200 rounded-lg bg-green-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Check size={18} className="text-green-600" />
            <span className="font-medium text-green-800">Successfully Humanized</span>
          </div>
          <div className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
            {results.humanScore}% Human Score
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Original (AI) Text</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => handleCopy('original')}
            >
              {copied.original ? (
                <>
                  <Check size={14} className="mr-1" /> Copied
                </>
              ) : (
                <>
                  <Copy size={14} className="mr-1" /> Copy
                </>
              )}
            </Button>
          </div>
          <div className="p-4 border rounded-lg bg-muted/30 min-h-[200px] text-sm overflow-auto">
            <p className="whitespace-pre-wrap">{results.originalText}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Humanized Text</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => handleCopy('humanized')}
            >
              {copied.humanized ? (
                <>
                  <Check size={14} className="mr-1" /> Copied
                </>
              ) : (
                <>
                  <Copy size={14} className="mr-1" /> Copy
                </>
              )}
            </Button>
          </div>
          <div className="p-4 border border-green-200 rounded-lg bg-green-50 min-h-[200px] text-sm overflow-auto">
            <p className="whitespace-pre-wrap leading-relaxed">{results.humanizedText}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-lg bg-blue-50 border-blue-200 flex gap-3">
        <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">About the humanized text</p>
          <p>This AI-generated content has been transformed to read more naturally with varied sentence structures, conversational elements, and authentic language patterns. The humanized version maintains the original meaning while incorporating subtle language imperfections that typify human writing.</p>
        </div>
      </div>
      
      <div className="flex justify-end gap-4">
        <Button variant="outline">
          <FileText size={16} className="mr-2" />
          Export Text
        </Button>
        <Button variant="secondary">
          <Bot size={16} className="mr-2" />
          Verify AI Detection
        </Button>
      </div>
    </div>
  );
};

export default HumanizeResults;
