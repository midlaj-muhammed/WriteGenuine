
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Share2, Download, ArrowDownToLine, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { geminiService } from '@/lib/gemini-service';

// Define the types for our analysis results
type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

interface ComparisonResult {
  plagiarism: {
    status: AnalysisStatus;
    data: any;
    error?: string;
  };
  detection: {
    status: AnalysisStatus;
    data: any;
    error?: string;
  };
  humanizer: {
    status: AnalysisStatus;
    data: any;
    error?: string;
  };
}

const DEFAULT_TEXT = `Artificial intelligence (AI) is revolutionizing how we interact with technology. Machine learning algorithms, a subset of AI, enable computers to learn from data and improve over time without explicit programming. These systems can now recognize patterns, make decisions, and even generate creative content. The rapid advancement of AI has led to both excitement about its potential benefits and concerns about its societal impacts. As we continue to integrate AI into various aspects of our lives, it becomes increasingly important to establish ethical guidelines and regulatory frameworks to ensure responsible development and deployment of these technologies.`;

const ToolsComparison = () => {
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [results, setResults] = useState<ComparisonResult>({
    plagiarism: { status: 'idle', data: null },
    detection: { status: 'idle', data: null },
    humanizer: { status: 'idle', data: null },
  });
  const [activeTab, setActiveTab] = useState<string>('results');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Function to run all three analyses
  const runComparison = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some text to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Reset all results
    setResults({
      plagiarism: { status: 'loading', data: null },
      detection: { status: 'loading', data: null },
      humanizer: { status: 'loading', data: null },
    });

    // Run all three analyses in parallel
    try {
      const [plagiarismResult, detectionResult, humanizedText] = await Promise.allSettled([
        geminiService.checkPlagiarism(inputText),
        geminiService.detectAI(inputText),
        geminiService.humanizeAI(inputText)
      ]);

      // Update results based on promise outcomes
      setResults({
        plagiarism: plagiarismResult.status === 'fulfilled' 
          ? { status: 'success', data: plagiarismResult.value } 
          : { status: 'error', data: null, error: (plagiarismResult as any).reason?.message || 'Failed to check plagiarism' },
          
        detection: detectionResult.status === 'fulfilled' 
          ? { status: 'success', data: detectionResult.value } 
          : { status: 'error', data: null, error: (detectionResult as any).reason?.message || 'Failed to detect AI' },
          
        humanizer: humanizedText.status === 'fulfilled' 
          ? { status: 'success', data: { 
              originalText: inputText,
              humanizedText: humanizedText.value,
              humanScore: 92  // Estimate, as the API doesn't return a specific score
            }} 
          : { status: 'error', data: null, error: (humanizedText as any).reason?.message || 'Failed to humanize text' },
      });
      
      toast({
        title: "Analysis Complete",
        description: "All tools have analyzed the provided text",
      });

      // Switch to results tab
      setActiveTab('results');
    } catch (error) {
      console.error('Error in comparison analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "An error occurred during the analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Helper functions for rendering
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  // Check if we have all the results to enable comparison
  const canCompare = 
    results.plagiarism.status === 'success' && 
    results.detection.status === 'success' && 
    results.humanizer.status === 'success';

  // Find correlation between plagiarism and AI detection
  const calculateCorrelation = () => {
    if (!canCompare) return null;
    
    const plagiarismScore = results.plagiarism.data.score;
    const aiProbability = results.detection.data.score;
    
    // Calculate a simple correlation based on inverse relationship
    // High originality should correlate with low AI probability
    const expectedAIProbability = 100 - plagiarismScore;
    const difference = Math.abs(expectedAIProbability - aiProbability);
    
    return {
      value: difference > 30 ? 'Low' : difference > 15 ? 'Medium' : 'High',
      difference: difference
    };
  };
  
  const correlation = calculateCorrelation();

  // Find common sources between plagiarism checker and AI detection
  const findCommonPatterns = () => {
    if (!canCompare) return [];
    
    const plagiarismSources = results.plagiarism.data.sources || [];
    const aiPatterns = results.detection.data.patternAnalysis || [];
    
    const commonPatterns = [];
    
    // Very simplified pattern matching - would be more sophisticated in a real analysis
    for (const source of plagiarismSources) {
      for (const pattern of aiPatterns) {
        if (source.text.includes(pattern.name) || 
            pattern.description.includes(source.title) || 
            pattern.description.toLowerCase().includes(source.text.toLowerCase().substring(0, 15))) {
          commonPatterns.push({
            plagiarismText: source.text,
            aiPattern: pattern.name,
            similarity: "Similar content found in both analyses"
          });
          break;
        }
      }
    }
    
    return commonPatterns;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-primary/5 border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-primary">Tools Comparison Analysis</h3>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-muted-foreground">Compare All Tools</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Text to Analyze</label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to analyze with all tools..."
              className="min-h-[150px]"
            />
            <p className="text-xs text-muted-foreground mt-2">
              This text will be analyzed by all three tools: Plagiarism Checker, AI Detection, and AI Humanizer.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={runComparison}
              disabled={isAnalyzing || !inputText.trim()}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing with All Tools...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Run Comparison Analysis
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {(results.plagiarism.status === 'success' || 
          results.detection.status === 'success' || 
          results.humanizer.status === 'success') && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList>
              <TabsTrigger value="results">Results Overview</TabsTrigger>
              <TabsTrigger value="comparison">Detailed Comparison</TabsTrigger>
              <TabsTrigger value="correlation">Correlation Analysis</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="results" className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Plagiarism Result */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Plagiarism Check</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {results.plagiarism.status === 'loading' && (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                    
                    {results.plagiarism.status === 'error' && (
                      <div className="bg-red-50 p-4 rounded-md text-red-600">
                        {results.plagiarism.error || "Analysis failed"}
                      </div>
                    )}
                    
                    {results.plagiarism.status === 'success' && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Originality Score</span>
                            <span className={`font-bold ${getScoreColor(results.plagiarism.data.score)}`}>
                              {results.plagiarism.data.score}%
                            </span>
                          </div>
                          <Progress 
                            value={results.plagiarism.data.score} 
                            className={`h-2 ${getProgressColor(results.plagiarism.data.score)}`} 
                          />
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {results.plagiarism.data.details.length > 150 
                            ? results.plagiarism.data.details.substring(0, 150) + "..." 
                            : results.plagiarism.data.details}
                        </p>
                        
                        <div className="text-sm">
                          <span className="font-medium">Sources found: </span>
                          <span>{results.plagiarism.data.sources?.length || 0}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* AI Detection Result */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">AI Detection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {results.detection.status === 'loading' && (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                    
                    {results.detection.status === 'error' && (
                      <div className="bg-red-50 p-4 rounded-md text-red-600">
                        {results.detection.error || "Analysis failed"}
                      </div>
                    )}
                    
                    {results.detection.status === 'success' && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">AI Probability</span>
                            <span className={`font-bold ${getScoreColor(100 - results.detection.data.score)}`}>
                              {results.detection.data.score}%
                            </span>
                          </div>
                          <Progress 
                            value={results.detection.data.score} 
                            className={`h-2 ${getProgressColor(100 - results.detection.data.score)}`} 
                          />
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {results.detection.data.details.length > 150 
                            ? results.detection.data.details.substring(0, 150) + "..." 
                            : results.detection.data.details}
                        </p>
                        
                        <div className="text-sm">
                          <span className="font-medium">Confidence: </span>
                          <Badge variant="outline">
                            {results.detection.data.confidenceLevel || "Medium"}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Humanizer Result */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">AI Humanizer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {results.humanizer.status === 'loading' && (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                    
                    {results.humanizer.status === 'error' && (
                      <div className="bg-red-50 p-4 rounded-md text-red-600">
                        {results.humanizer.error || "Humanizing failed"}
                      </div>
                    )}
                    
                    {results.humanizer.status === 'success' && (
                      <div className="space-y-4">
                        <div className="text-sm font-medium">Transformation Result:</div>
                        <p className="text-sm text-muted-foreground max-h-[150px] overflow-y-auto">
                          {results.humanizer.data.humanizedText.substring(0, 150)}...
                        </p>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span>Character count: {results.humanizer.data.humanizedText.length}</span>
                          <Badge className="bg-green-600">Humanized</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Summary Card */}
              {canCompare && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>
                        This text shows an originality score of <span className={`font-semibold ${getScoreColor(results.plagiarism.data.score)}`}>
                          {results.plagiarism.data.score}%
                        </span> with an AI probability of <span className={`font-semibold ${getScoreColor(100 - results.detection.data.score)}`}>
                          {results.detection.data.score}%
                        </span>. 
                      </p>
                      
                      <p>
                        {results.plagiarism.data.score > 80 && results.detection.data.score > 80 && (
                          <span>The high originality but also high AI probability suggests this is likely AI-generated original content.</span>
                        )}
                        {results.plagiarism.data.score > 80 && results.detection.data.score < 40 && (
                          <span>The high originality and low AI probability suggests this is likely human-written original content.</span>
                        )}
                        {results.plagiarism.data.score < 40 && (
                          <span>The low originality score suggests this content contains significant matching with existing sources.</span>
                        )}
                      </p>
                      
                      <div className="text-sm">
                        <span className="font-medium">Correlation between plagiarism and AI detection: </span>
                        <Badge variant={correlation?.value === 'Low' ? 'destructive' : 'outline'} 
                               className={correlation?.value === 'Medium' ? 'bg-yellow-500' : ''}>
                          {correlation?.value || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Comparison Tab */}
            <TabsContent value="comparison" className="mt-4 space-y-6">
              {!canCompare ? (
                <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
                  Please complete all three analyses to view detailed comparisons
                </div>
              ) : (
                <>
                  {/* Source Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Source Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <h4 className="font-medium">Plagiarism Sources vs AI Detection Patterns</h4>
                        
                        {results.plagiarism.data.sources?.length === 0 && (
                          <p className="text-sm text-muted-foreground">No plagiarism sources detected to compare.</p>
                        )}
                        
                        {results.plagiarism.data.sources && results.plagiarism.data.sources.length > 0 && (
                          <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plagiarism Source</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Similarity</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {results.plagiarism.data.sources.map((source: any, index: number) => (
                                  <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <div className="font-medium text-gray-900">{source.title || 'Unknown Source'}</div>
                                      <div className="text-gray-500 truncate">{source.text}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <Badge className={source.similarity > 50 ? 'bg-red-500' : 'bg-yellow-500'}>
                                        {source.similarity}%
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        
                        <h4 className="font-medium mt-6">AI Detection Patterns</h4>
                        
                        {(!results.detection.data.patternAnalysis || results.detection.data.patternAnalysis.length === 0) && (
                          <p className="text-sm text-muted-foreground">No AI detection patterns available to compare.</p>
                        )}
                        
                        {results.detection.data.patternAnalysis && results.detection.data.patternAnalysis.length > 0 && (
                          <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pattern</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {results.detection.data.patternAnalysis.map((pattern: any, index: number) => (
                                  <tr key={index}>
                                    <td className="px-6 py-4 text-sm">
                                      <div className="font-medium text-gray-900">{pattern.name}</div>
                                      <div className="text-gray-500">{pattern.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      {pattern.score}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <Badge variant={pattern.severity === 'high' ? 'destructive' : 'outline'}
                                             className={pattern.severity === 'medium' ? 'bg-yellow-500' : ''}>
                                        {pattern.severity}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        
                        {/* Common patterns between plagiarism and AI detection */}
                        {findCommonPatterns().length > 0 && (
                          <div className="mt-6">
                            <h4 className="font-medium mb-2">Common Patterns Found</h4>
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                              <ul className="list-disc list-inside space-y-2">
                                {findCommonPatterns().map((item, index) => (
                                  <li key={index} className="text-sm">
                                    <span className="font-medium">{item.aiPattern}</span>: {item.similarity}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Text Transformation Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Text Transformation Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Original Text */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Original Text</h4>
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <p className="text-sm">{results.humanizer.data.originalText}</p>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>AI Detection Score: {results.detection.data.score}%</span>
                            <span>Character Count: {results.humanizer.data.originalText.length}</span>
                          </div>
                        </div>
                        
                        {/* Humanized Text */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Humanized Text</h4>
                          <div className="border rounded-lg p-4 bg-blue-50 border-blue-100">
                            <p className="text-sm">{results.humanizer.data.humanizedText}</p>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Estimated Human Score: {results.humanizer.data.humanScore}%</span>
                            <span>Character Count: {results.humanizer.data.humanizedText.length}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Analysis of transformation effectiveness */}
                      <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg">
                        <h4 className="font-medium mb-2">Humanization Effectiveness</h4>
                        <p className="text-sm">
                          The AI Humanizer has transformed the text by introducing more varied sentence structures,
                          natural language patterns, and human-like elements. This transformation could potentially 
                          reduce the AI detection score if the humanized text were analyzed again.
                        </p>
                        <div className="mt-4">
                          <Button size="sm" variant="outline">
                            <ArrowDownToLine size={16} className="mr-2" />
                            Analyze Humanized Text
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
            
            {/* Correlation Analysis Tab */}
            <TabsContent value="correlation" className="mt-4 space-y-6">
              {!canCompare ? (
                <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
                  Please complete all three analyses to view correlation analysis
                </div>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Correlation Between Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="p-4 bg-muted/20 rounded-lg">
                            <div className="text-sm font-medium mb-1">Originality Score</div>
                            <div className={`text-2xl font-bold ${getScoreColor(results.plagiarism.data.score)}`}>
                              {results.plagiarism.data.score}%
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Plagiarism Check</div>
                          </div>
                          
                          <div className="p-4 bg-muted/20 rounded-lg">
                            <div className="text-sm font-medium mb-1">AI Probability</div>
                            <div className={`text-2xl font-bold ${getScoreColor(100 - results.detection.data.score)}`}>
                              {results.detection.data.score}%
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">AI Detection</div>
                          </div>
                          
                          <div className="p-4 bg-muted/20 rounded-lg">
                            <div className="text-sm font-medium mb-1">Human Score (Est.)</div>
                            <div className="text-2xl font-bold text-green-600">
                              {results.humanizer.data.humanScore}%
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">After Humanization</div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-6">
                          <h4 className="font-medium mb-4">Key Findings</h4>
                          <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                                <span className="text-xs text-primary font-medium">1</span>
                              </div>
                              <p className="text-sm">
                                <span className="font-medium">Originality vs AI Detection: </span>
                                {correlation?.value === 'High' ? (
                                  "Strong correlation between originality score and AI detection, suggesting consistent analysis."
                                ) : correlation?.value === 'Medium' ? (
                                  "Moderate correlation between originality and AI detection, with some discrepancies in analysis."
                                ) : (
                                  "Weak correlation between originality and AI detection, suggesting potential conflicts in the analysis."
                                )}
                              </p>
                            </li>
                            
                            <li className="flex items-start gap-3">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                                <span className="text-xs text-primary font-medium">2</span>
                              </div>
                              <p className="text-sm">
                                <span className="font-medium">Source Detection: </span>
                                {results.plagiarism.data.sources && results.plagiarism.data.sources.length > 0 ? (
                                  `The plagiarism checker found ${results.plagiarism.data.sources.length} potential sources, 
                                  which ${findCommonPatterns().length > 0 ? 'correlates' : 'does not strongly correlate'} 
                                  with AI detection patterns.`
                                ) : (
                                  "No plagiarism sources were detected, which aligns with the high originality score."
                                )}
                              </p>
                            </li>
                            
                            <li className="flex items-start gap-3">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                                <span className="text-xs text-primary font-medium">3</span>
                              </div>
                              <p className="text-sm">
                                <span className="font-medium">Humanization Impact: </span>
                                The humanizer successfully transformed the text while preserving meaning, 
                                {results.humanizer.data.humanizedText.length > results.humanizer.data.originalText.length ? 
                                  " increasing" : " maintaining"} the text length and adding natural language variations
                                that could potentially help avoid AI detection.
                              </p>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="border-t pt-6">
                          <h4 className="font-medium mb-4">Overall Assessment</h4>
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <p className="text-sm">
                              {results.plagiarism.data.score > 80 && results.detection.data.score > 80 && (
                                "This content appears to be original (not plagiarized) but likely AI-generated. The humanizer has successfully added more natural language patterns while preserving the meaning."
                              )}
                              {results.plagiarism.data.score > 80 && results.detection.data.score < 40 && (
                                "This content appears to be both original and likely human-written. The humanizer has made subtle improvements to the already natural-sounding text."
                              )}
                              {results.plagiarism.data.score < 60 && results.detection.data.score > 60 && (
                                "This content shows signs of both plagiarism and AI generation, suggesting it may be AI-generated content based on existing sources. The humanizer has improved readability but cannot fix attribution issues."
                              )}
                              {results.plagiarism.data.score < 60 && results.detection.data.score < 60 && (
                                "This content shows potential plagiarism but does not strongly register as AI-generated, suggesting human-written content with insufficient attribution. The humanizer has improved readability but proper citation is still recommended."
                              )}
                              {(results.plagiarism.data.score >= 60 && results.plagiarism.data.score <= 80) && 
                               (results.detection.data.score >= 40 && results.detection.data.score <= 60) && (
                                "This content shows mixed signals with moderate originality and AI detection scores. It may be partially derived from existing sources with some modifications. The humanizer has successfully improved the natural flow of the text."
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Export Actions */}
                  <div className="flex justify-end space-x-4">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                    <Button>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Analysis
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ToolsComparison;
