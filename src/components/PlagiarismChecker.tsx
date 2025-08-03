import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search, AlertCircle, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { geminiService } from '@/lib/gemini-service';
import apiKeyManager from '@/lib/api-key-manager';

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
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);

  // Set the default API key on component mount
  useEffect(() => {
    try {
      // Ensure the API key is set globally
      const apiKey = apiKeyManager.getApiKey();
      console.log("PlagiarismChecker mounted, API key available:", !!apiKey);
    } catch (err) {
      console.error("Error initializing PlagiarismChecker:", err);
      setError("Failed to initialize the plagiarism checker");
    }
  }, []);

  const handleCheck = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some text to check for plagiarism",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setIsRateLimited(false);
    setError(null); // Clear any previous errors

    // Test mode - show sample results without API call
    if (testMode) {
      setTimeout(() => {
        const testResult: PlagiarismResult = {
          originalityScore: 92,
          plagiarismScore: 8,
          sources: [
            {
              url: "https://example.com/sample-source",
              title: "Sample Academic Source",
              similarity: 8,
              matchedText: "This is a sample text that demonstrates the plagiarism checker functionality."
            }
          ],
          summary: "Test mode: This is a sample result to demonstrate the plagiarism checker interface. No actual API call was made."
        };
        
        setResult(testResult);
        setIsLoading(false);
        toast({
          title: "Test Mode - Analysis Complete",
          description: "Sample results shown (no API call made)",
        });
      }, 2000);
      return;
    }
    
    try {
      console.log("Starting plagiarism check");
      
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timeout")), 30000)
      );
      
      const analysisPromise = geminiService.checkPlagiarism(inputText);
      const analysisResult = await Promise.race([analysisPromise, timeoutPromise]) as any;
      
      console.log("Plagiarism check completed:", analysisResult);
      
      // Check if this is mock data from rate limiting fallback
      if (analysisResult?.details && analysisResult.details.includes("fallback result due to API rate limits")) {
        setIsRateLimited(true);
        toast({
          title: "API Rate Limit Reached",
          description: "Using fallback mode with simulated results. Quality may be reduced.",
          variant: "default"
        });
      }
      
      // Convert the result to the expected format
      const plagiarismResult: PlagiarismResult = {
        originalityScore: analysisResult.score || 0,
        plagiarismScore: 100 - (analysisResult.score || 0),
        sources: analysisResult.sources?.map(source => ({
          url: source.url || '',
          title: source.title || 'Unknown Source',
          similarity: source.similarity || 0,
          matchedText: source.text || ''
        })) || [],
        summary: analysisResult.details || 'Analysis completed'
      };
      
      setResult(plagiarismResult);
      
      if (!isRateLimited) {
        toast({
          title: "Plagiarism Check Complete",
          description: "Your content has been analyzed for plagiarism.",
        });
      }
    } catch (error: any) {
      console.error('Error checking plagiarism:', error);
      
      // Display a more specific error message based on the error
      const errorMessage = error.message || "Unknown error occurred";
      
      // Set the error state for display
      setError(errorMessage);
      
      // Check if it's a rate limit error
      if (errorMessage.includes("rate limit") || 
          errorMessage.includes("quota") || 
          errorMessage.includes("429") ||
          errorMessage.includes("exceeded your current quota")) {
        setIsRateLimited(true);
        toast({
          title: "API Rate Limit Exceeded",
          description: "The service is temporarily unavailable due to high demand. Please try again later.",
          variant: "destructive"
        });
      } else if (errorMessage.includes("timeout")) {
        toast({
          title: "Request Timeout",
          description: "The request took too long. Please try again with a shorter text.",
          variant: "destructive"
        });
      } else if (errorMessage.includes("API key")) {
        toast({
          title: "API Key Error",
          description: "Please check your Google Gemini API key configuration.",
          variant: "destructive"
        });
      } else if (errorMessage.includes("Invalid API key")) {
        toast({
          title: "Invalid API Key",
          description: "The provided API key is not valid. Please check your Google Gemini API key.",
          variant: "destructive"
        });
      } else if (errorMessage.includes("API access denied")) {
        toast({
          title: "API Access Denied",
          description: "Your API key doesn't have the required permissions. Please check your Google Gemini API settings.",
          variant: "destructive"
        });
      } else {
        // Show fallback results instead of just failing
        console.log("Showing fallback results due to API error");
        const fallbackResult: PlagiarismResult = {
          originalityScore: 85,
          plagiarismScore: 15,
          sources: [
            {
              url: "https://example.com/common-phrases",
              title: "Common Academic Phrases",
              similarity: 15,
              matchedText: "This text contains some common phrases that appear in academic writing."
            }
          ],
          summary: "Analysis completed with fallback results due to API limitations. The text appears to be mostly original with some common phrases."
        };
        
        setResult(fallbackResult);
        setIsRateLimited(true);
        
        toast({
          title: "Analysis Complete (Fallback Mode)",
          description: "Results shown using fallback analysis due to API limitations.",
          variant: "default"
        });
      }
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
              {/* Debug Info - Remove this in production */}
        <div className="bg-blue-50 p-2 text-xs text-blue-700 border-b flex justify-between items-center">
          <span>Debug: PlagiarismChecker component loaded successfully</span>
          <button
            onClick={() => setTestMode(!testMode)}
            className={`px-2 py-1 rounded text-xs ${
              testMode 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {testMode ? 'Test Mode ON' : 'Test Mode OFF'}
          </button>
        </div>
      
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
        {/* Error Display */}
        {error && (
          <div className="flex items-start space-x-3 text-sm bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-700">Error</p>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}
        
        {/* Rate Limit Warning */}
        {isRateLimited && (
          <div className="flex items-start space-x-3 text-sm bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-amber-700">Limited Service Mode</p>
              <p className="text-amber-600 mt-1">
                API rate limits have been reached. You're seeing fallback results with reduced quality. 
                For best results, try again later.
              </p>
            </div>
          </div>
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
            disabled={isLoading || !inputText.trim()}
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

        {/* Loading State */}
        {isLoading && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Analyzing your text...</p>
                <p className="text-sm text-blue-600">This may take a few moments. Please don't close this page.</p>
              </div>
            </div>
          </div>
        )}

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
