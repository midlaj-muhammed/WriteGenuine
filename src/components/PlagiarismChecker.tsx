
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { geminiService } from '@/lib/gemini-service';

interface Source {
  url: string;
  title: string;
  similarity: number;
  matchedText: string;
}

interface PlagiarismResult {
  originalityScore: number;
  plagiarismScore: number;
  sources: Source[];
  summary: string;
}

const PlagiarismChecker = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      // Update the API key in the service
      if (typeof window !== 'undefined') {
        (window as any).geminiApiKey = savedKey;
      }
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    // Update the API key in the service
    if (typeof window !== 'undefined') {
      (window as any).geminiApiKey = key;
    }
    toast({
      title: "API Key Saved",
      description: "Your API key has been saved to your browser's local storage.",
    });
  };

  const handleCheck = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google Generative AI API key to use this feature.",
        variant: "destructive"
      });
      return;
    }

    if (!inputText.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some text to check for plagiarism",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const analysisResult = await geminiService.checkPlagiarism(inputText);
      
      // Convert the result to the expected format
      const plagiarismResult: PlagiarismResult = {
        originalityScore: analysisResult.score,
        plagiarismScore: 100 - analysisResult.score,
        sources: analysisResult.sources?.map(source => ({
          url: source.url,
          title: source.title || 'Unknown Source',
          similarity: source.similarity,
          matchedText: source.text
        })) || [],
        summary: analysisResult.details
      };
      
      setResult(plagiarismResult);
      toast({
        title: "Plagiarism Check Complete",
        description: "Your content has been analyzed for plagiarism.",
      });
    } catch (error) {
      console.error('Error checking plagiarism:', error);
      toast({
        title: "Failed to check plagiarism",
        description: "Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityLabel = (originalityScore: number) => {
    if (originalityScore >= 70) return 'Highly Original';
    if (originalityScore >= 30) return 'Partially Original';
    return 'Possible Plagiarism';
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-primary">Plagiarism Checker</h3>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-muted-foreground">Powered by WriteGenuine</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {!apiKey && (
          <Card className="mb-6">
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
                  value={apiKey || ''}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={() => handleApiKeySubmit(apiKey || '')} disabled={!apiKey?.trim()}>
                  Save Key
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your API key will only be stored in your browser's local storage.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Input Section */}
        <div>
          <label className="block text-sm font-medium mb-2">Text to Check</label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter the text you want to check for plagiarism..."
            className="min-h-[150px]"
          />
          <p className="text-xs text-muted-foreground mt-2">
            For best results, enter at least 300 characters.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleCheck}
            disabled={isLoading || !inputText.trim() || !apiKey}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Check for Plagiarism
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Originality Score</label>
                <div className={`text-lg font-bold ${getScoreColor(result.originalityScore)}`}>
                  {result.originalityScore}%
                </div>
              </div>
              <Progress value={result.originalityScore} className={`h-2 ${getProgressColor(result.originalityScore)}`} />
              <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                <span>Low Originality</span>
                <span>{getSeverityLabel(result.originalityScore)}</span>
                <span>High Originality</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Analysis</label>
              <div className="bg-muted/30 rounded-lg p-4 text-sm">
                {result.summary}
              </div>
            </div>

            {result.sources && result.sources.length > 0 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium">Potential Sources</label>
                {result.sources.map((source, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{source.title}</h4>
                      <span className={`text-sm font-medium ${source.similarity > 50 ? 'text-red-500' : 'text-yellow-500'}`}>
                        {source.similarity}% match
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{source.url}</p>
                    <div className="bg-yellow-50 p-2 text-xs rounded border border-yellow-200 mt-2">
                      "{source.matchedText}"
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-start space-x-3 text-sm bg-blue-50 p-4 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-700">Disclaimer</p>
                <p className="text-blue-600 mt-1">
                  This is a simulated plagiarism check. For academic or professional use, we recommend verifying with multiple tools and comprehensive checks.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlagiarismChecker;
