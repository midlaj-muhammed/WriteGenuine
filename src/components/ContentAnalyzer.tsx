
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Check, Copy, Info } from 'lucide-react';
import geminiService, { ContentAnalysisResult } from '@/lib/gemini-service';
import { toast } from '@/components/ui/use-toast';
import apiKeyManager from '@/lib/api-key-manager';

interface AnalysisState {
  loading: boolean;
  result?: ContentAnalysisResult | string;
  error?: string;
}

const ContentAnalyzer = () => {
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState('plagiarism');
  const [analysis, setAnalysis] = useState<AnalysisState>({
    loading: false,
  });
  const [copied, setCopied] = useState(false);

  // Set the default API key on component mount
  useEffect(() => {
    // Ensure the API key is set globally
    apiKeyManager.getApiKey();
  }, []);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some text to analyze",
        variant: "destructive"
      });
      return;
    }

    setAnalysis({ loading: true });

    try {
      let result;
      switch (activeTab) {
        case 'plagiarism':
          result = await geminiService.checkPlagiarism(text);
          break;
        case 'ai-detection':
          result = await geminiService.detectAI(text);
          break;
        case 'humanize':
          result = await geminiService.humanizeAI(text);
          break;
      }
      setAnalysis({ loading: false, result });
      toast({
        title: "Analysis Complete",
        description: `Your ${activeTab} analysis has completed successfully.`,
      });
    } catch (error) {
      console.error("Error analyzing text:", error);
      setAnalysis({
        loading: false,
        error: 'Failed to analyze text. Please try again.',
      });
      toast({
        title: "Analysis Failed",
        description: "Unable to process your request. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleCopy = () => {
    if (typeof analysis.result === 'string') {
      navigator.clipboard.writeText(analysis.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Text copied to clipboard.",
      });
    }
  };

  const renderResult = () => {
    if (analysis.loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Analyzing...</span>
        </div>
      );
    }

    if (analysis.error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{analysis.error}</AlertDescription>
        </Alert>
      );
    }

    if (!analysis.result) {
      return null;
    }

    if (typeof analysis.result === 'string') {
      // Humanized text result
      return (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Humanized Text</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
          
          <div className="border rounded-lg p-4 mb-4 bg-muted/20">
            <p className="whitespace-pre-wrap text-base leading-relaxed">{analysis.result}</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm bg-primary/5 p-3 rounded-md">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              The text has been humanized with natural language patterns, varied sentence structures, and conversational elements.
            </span>
          </div>
        </Card>
      );
    }

    // Content analysis result
    const result = analysis.result as ContentAnalysisResult;
    return (
      <Card className="p-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">
              {activeTab === 'plagiarism' ? 'Plagiarism Score' : 'AI Probability'}:
            </span>
            <span className="font-bold">{result.score}%</span>
          </div>
          <Progress value={result.score} className="h-2" />
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Analysis:</h3>
          <p className="whitespace-pre-wrap text-muted-foreground">
            {result.details}
          </p>
        </div>

        {result.suggestions && result.suggestions.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Suggestions:</h3>
            <ul className="list-disc list-inside text-muted-foreground">
              {result.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plagiarism">Plagiarism Check</TabsTrigger>
          <TabsTrigger value="ai-detection">AI Detection</TabsTrigger>
          <TabsTrigger value="humanize">AI Humanizer</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <Textarea
            placeholder="Enter your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px] mb-4"
          />

          <Button
            onClick={handleAnalyze}
            disabled={analysis.loading}
            className="w-full"
          >
            {analysis.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze'
            )}
          </Button>

          <div className="mt-6">{renderResult()}</div>
        </div>
      </Tabs>
    </div>
  );
};

export default ContentAnalyzer;
