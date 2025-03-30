import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Bot, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { detectAI } from '@/services/freeAIService';

const AIDetectionTool = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<{
    score: number;
    aiProbability: number;
    humanProbability: number;
    analysis: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setIsLoading(true);
    try {
      const analysisResult = await detectAI(inputText);
      
      setResult({
        score: analysisResult.aiProbability,
        aiProbability: analysisResult.aiProbability,
        humanProbability: analysisResult.humanProbability,
        analysis: analysisResult.analysis
      });
      toast.success('Analysis complete');
    } catch (error) {
      console.error('Error analyzing text:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      
      toast.error('Failed to analyze text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 30) return 'text-green-500';
    if (score <= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score <= 30) return 'bg-green-500';
    if (score <= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 30) return 'Likely Human';
    if (score <= 70) return 'Uncertain';
    return 'Likely AI';
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-primary">AI Content Detector</h3>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-muted-foreground">Free Detection Tool</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Input Section */}
        <div>
          <label className="block text-sm font-medium mb-2">Text to Analyze</label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter the text you want to analyze for AI detection..."
            className="min-h-[150px]"
          />
          <p className="text-xs text-muted-foreground mt-2">
            For best results, enter at least 300 characters.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !inputText.trim()}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4" />
                Detect AI Content
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">AI Probability</label>
                <div className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                  {result.score}%
                </div>
              </div>
              <Progress value={result.score} className={`h-2 ${getProgressColor(result.score)}`} />
              <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                <span>Human</span>
                <span>{getScoreLabel(result.score)}</span>
                <span>AI</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Analysis</label>
              <div className="bg-muted/30 rounded-lg p-4 text-sm">
                {result.analysis}
              </div>
            </div>

            <div className="flex items-start space-x-3 text-sm bg-blue-50 p-4 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-700">Disclaimer</p>
                <p className="text-blue-600 mt-1">
                  This is an experimental tool. Results may not be 100% accurate, especially for shorter texts or highly skilled human writers and AI content.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDetectionTool; 