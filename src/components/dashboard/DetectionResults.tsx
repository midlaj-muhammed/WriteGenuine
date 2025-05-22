
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Copy, 
  Check, 
  BarChart2, 
  AlertTriangle, 
  CheckCircle, 
  Brain, 
  User,
  Zap,
  FileText
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { AIDetectionResult, AIPatternAnalysis } from '@/lib/gemini-service';

interface DetectionResultsProps {
  results: AIDetectionResult;
}

const DetectionResults = ({ results }: DetectionResultsProps) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(results.details);
    setCopied(true);
    toast({
      title: "Copied",
      description: "Analysis details have been copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Get color based on AI probability (higher AI probability = more concerning = more red)
  const getAIScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Get background color for progress bar
  const getAIScoreBgColor = (score: number) => {
    if (score < 30) return 'bg-green-600';
    if (score < 70) return 'bg-yellow-600';
    return 'bg-red-600';
  };
  
  // Get assessment message
  const getAssessmentMessage = (score: number) => {
    if (score < 30) return 'Likely human-written';
    if (score < 70) return 'Possibly AI-generated';
    return 'Likely AI-generated';
  };
  
  // Get confidence level color
  const getConfidenceLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-slate-400';
      default: return 'bg-slate-400';
    }
  };
  
  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500 text-yellow-950';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-400';
    }
  };
  
  // Check if pattern analysis exists and has content
  const hasPatternAnalysis = results.patternAnalysis && 
                            Array.isArray(results.patternAnalysis) && 
                            results.patternAnalysis.length > 0;
                            
  // Check if highlighted text examples exist and have content
  const hasHighlightedText = results.highlightedText && 
                            Array.isArray(results.highlightedText) && 
                            results.highlightedText.length > 0;
  
  return (
    <div className="mt-8 space-y-6 animate-fade-in">
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="examples">Text Examples</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-semibold">AI Probability</h3>
                  <p className="text-muted-foreground">How likely this was written by an AI</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-3xl font-bold ${getAIScoreColor(results.score)}`}>
                    {results.score}%
                  </span>
                  <span className={`text-sm ${getAIScoreColor(results.score)}`}>
                    {getAssessmentMessage(results.score)}
                  </span>
                </div>
              </div>
              
              <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getAIScoreBgColor(results.score)}`}
                  style={{ width: `${results.score}%` }}
                ></div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Confidence Level</span>
                  <Badge className={getConfidenceLevelColor(results.confidenceLevel || 'medium')}>
                    {results.confidenceLevel || 'Medium'}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Analysis</h4>
                  <div className="relative">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 absolute top-0 right-0"
                      onClick={handleCopy}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </Button>
                    <p className="text-muted-foreground pr-8">{results.details}</p>
                  </div>
                </div>
                
                {results.patterns && (
                  <div>
                    <h4 className="font-medium mb-2">Pattern Indicators</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="text-sm font-medium mb-1 flex items-center">
                          <BarChart2 className="h-4 w-4 mr-1 text-blue-500" />
                          Repetitive Patterns
                        </div>
                        <Badge variant="outline" className="font-medium">
                          {results.patterns.repetitive}
                        </Badge>
                      </div>
                      
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="text-sm font-medium mb-1 flex items-center">
                          <Brain className="h-4 w-4 mr-1 text-purple-500" />
                          Complexity
                        </div>
                        <Badge variant="outline" className="font-medium">
                          {results.patterns.complexity}
                        </Badge>
                      </div>
                      
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="text-sm font-medium mb-1 flex items-center">
                          <Zap className="h-4 w-4 mr-1 text-amber-500" />
                          Variability
                        </div>
                        <Badge variant="outline" className="font-medium">
                          {results.patterns.variability}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
                
                {results.textStatistics && (
                  <div>
                    <h4 className="font-medium mb-2">Text Statistics</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-2 bg-muted/10 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">
                          Avg. Sentence Length
                        </div>
                        <div className="font-mono text-sm font-medium">
                          {results.textStatistics.averageSentenceLength.toFixed(1)} words
                        </div>
                      </div>
                      
                      <div className="p-2 bg-muted/10 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">
                          Vocabulary Diversity
                        </div>
                        <div className="font-mono text-sm font-medium">
                          {results.textStatistics.vocabularyDiversity.toFixed(0)}%
                        </div>
                      </div>
                      
                      <div className="p-2 bg-muted/10 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">
                          Repetitive Phrases
                        </div>
                        <div className="font-mono text-sm font-medium">
                          {results.textStatistics.repetitivePhrasesCount}
                        </div>
                      </div>
                      
                      <div className="p-2 bg-muted/10 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">
                          Uncommon Words
                        </div>
                        <div className="font-mono text-sm font-medium">
                          {results.textStatistics.uncommonWordsPercentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center space-x-2">
              {results.score >= 70 ? (
                <AlertTriangle className="text-red-500 h-5 w-5" />
              ) : results.score >= 30 ? (
                <AlertTriangle className="text-yellow-500 h-5 w-5" />
              ) : (
                <CheckCircle className="text-green-500 h-5 w-5" />
              )}
              <span className="text-sm">
                {results.score >= 70 
                  ? 'High probability of AI-generated content' 
                  : results.score >= 30
                  ? 'Mixed signals of AI and human writing'
                  : 'Likely human-written content'}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileText size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="patterns" className="space-y-4">
          {hasPatternAnalysis ? (
            <>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">AI Writing Patterns</h3>
                  <div className="space-y-5">
                    {results.patternAnalysis?.map((pattern, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-primary font-medium">{index + 1}</span>
                            </div>
                            <h4 className="font-medium">{pattern.name}</h4>
                          </div>
                          <Badge className={getSeverityColor(pattern.severity)}>
                            {pattern.severity}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Prominence</span>
                          <span className="text-sm font-medium">{pattern.score}%</span>
                        </div>
                        
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                          <div 
                            className="h-full bg-primary"
                            style={{ width: `${pattern.score}%` }}
                          ></div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{pattern.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Understanding Pattern Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    AI detection algorithms look for specific patterns that differ between human and AI writing.
                    Human writing tends to have greater variability, imperfections, and unique stylistic choices,
                    while AI-generated content often shows more consistency in structure, transitions, and phrase usage.
                  </p>
                  
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border bg-muted/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">AI Patterns</span>
                      </div>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>• Consistent sentence structure</li>
                        <li>• Predictable transitions</li>
                        <li>• Formal, neutral language</li>
                        <li>• Highly coherent arguments</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 rounded-lg border bg-muted/5">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Human Patterns</span>
                      </div>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>• Varied sentence structure</li>
                        <li>• Unexpected word choices</li>
                        <li>• Personal voice elements</li>
                        <li>• Occasional tangents</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-medium text-lg">Pattern analysis not available</h3>
              <p className="text-muted-foreground">
                Detailed pattern analysis couldn't be generated for this text.
                This might be due to the text length or content type.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="examples" className="space-y-4">
          {hasHighlightedText ? (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">AI Detection Examples</h3>
                <div className="space-y-4">
                  {results.highlightedText?.map((example, index) => (
                    <div key={index} className="rounded-lg border overflow-hidden">
                      <div className="bg-muted/20 p-3 border-b">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Example {index + 1}</h4>
                          <Badge variant="outline">{example.type}</Badge>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-muted/5">
                        <p className="text-sm italic mb-3">"{example.text}"</p>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{example.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-medium text-lg">Text examples not available</h3>
              <p className="text-muted-foreground">
                Specific text examples couldn't be extracted for this content.
                This might be due to the text length or content type.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DetectionResults;
