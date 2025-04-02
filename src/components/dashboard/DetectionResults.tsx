
import React from 'react';
import { 
  Bot, 
  User, 
  AlertTriangle, 
  Info, 
  BarChart3, 
  ArrowRight,
  Cpu,
  Lightbulb,
  BarChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AIPatternAnalysis, AIDetectionResult } from '@/lib/gemini-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';

interface DetectionResultsProps {
  results: AIDetectionResult;
}

const DetectionResults = ({ results }: DetectionResultsProps) => {
  // Format score color based on AI probability
  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score < 40) return 'bg-green-600';
    if (score < 70) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getConfidenceBadge = (level: string = 'medium') => {
    if (level === 'high') return <Badge className="bg-red-500">High Confidence</Badge>;
    if (level === 'medium') return <Badge className="bg-yellow-500">Medium Confidence</Badge>;
    return <Badge variant="outline">Low Confidence</Badge>;
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'text-red-500';
    if (severity === 'medium') return 'text-yellow-500';
    return 'text-green-500';
  };

  const getSeverityBgColor = (severity: string) => {
    if (severity === 'high') return 'bg-red-100 border-red-300';
    if (severity === 'medium') return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  };

  return (
    <div className="mt-8 animate-fade-in">
      <Tabs defaultValue="summary">
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="analysis">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="examples">Text Examples</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-semibold">AI Detection Result</h3>
                  <div className="flex items-center mt-1">
                    {getConfidenceBadge(results.confidenceLevel)}
                    <span className="text-muted-foreground text-sm ml-2">
                      Analysis completed
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-3xl font-bold ${getScoreColor(results.score)}`}>
                    {results.score}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    AI Probability
                  </span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Human Written</span>
                    <span>AI Generated</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getScoreBg(results.score)}`}
                      style={{ width: `${results.score}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={18} className="text-green-600" />
                      <span className="font-medium">Human Probability</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {results.humanProbability || (100 - results.score)}%
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot size={18} className="text-red-600" />
                      <span className="font-medium">AI Probability</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {results.score}%
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border border-muted bg-muted/10">
                  <h4 className="font-medium mb-2">Analysis</h4>
                  <p className="text-muted-foreground">
                    {results.details}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-3 gap-4">
            {results.patterns && Object.entries(results.patterns).map(([key, value]) => (
              <Card key={key} className="overflow-hidden">
                <CardHeader className="p-3 bg-muted/30">
                  <CardTitle className="text-sm capitalize font-medium">{key}</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className={`text-lg font-semibold ${
                    value === 'High' ? 'text-red-600' : 
                    value === 'Medium' ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.patternAnalysis && results.patternAnalysis.map((pattern, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{pattern.name}</h3>
                    <Badge 
                      variant={pattern.severity === 'high' ? 'destructive' : 'outline'}
                      className={pattern.severity === 'medium' ? 'bg-yellow-500' : ''}
                    >
                      {pattern.severity === 'high' ? 'High' : 
                      pattern.severity === 'medium' ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={pattern.score} 
                    className={`h-2 mb-3 ${
                      pattern.score > 70 ? 'bg-red-200' : 
                      pattern.score > 40 ? 'bg-yellow-200' : 
                      'bg-green-200'
                    }`}
                  />
                  
                  <p className="text-sm text-muted-foreground">
                    {pattern.description}
                  </p>
                </CardContent>
              </Card>
            ))}
            
            {(!results.patternAnalysis || results.patternAnalysis.length === 0) && (
              <Card className="col-span-2">
                <CardContent className="p-6 text-center">
                  <Info className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p>No detailed pattern analysis available for this text.</p>
                </CardContent>
              </Card>
            )}
          </div>
          
          {results.textStatistics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Text Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Avg. Sentence Length</div>
                    <div className="text-xl font-bold mt-1">{results.textStatistics.averageSentenceLength}</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Vocabulary Diversity</div>
                    <div className="text-xl font-bold mt-1">{results.textStatistics.vocabularyDiversity}%</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Repetitive Phrases</div>
                    <div className="text-xl font-bold mt-1">{results.textStatistics.repetitivePhrasesCount}</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Uncommon Words</div>
                    <div className="text-xl font-bold mt-1">{results.textStatistics.uncommonWordsPercentage}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="examples">
          <div className="space-y-4">
            {results.highlightedText && results.highlightedText.length > 0 ? (
              results.highlightedText.map((highlight, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className={`p-3 mb-3 rounded-lg border ${getSeverityBgColor(
                      highlight.type === 'repetition' || highlight.type === 'pattern' ? 'high' : 'medium'
                    )}`}>
                      <p className="text-sm font-medium">"{highlight.text}"</p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${getSeverityColor(
                        highlight.type === 'repetition' || highlight.type === 'pattern' ? 'high' : 'medium'
                      )}`} />
                      <div>
                        <p className="font-medium capitalize">{highlight.type}</p>
                        <p className="text-sm text-muted-foreground">{highlight.reason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Info className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p>No specific text examples available for this analysis.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="suggestions">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold">How to make this text more human-like</h3>
              </div>
              
              {results.suggestions && results.suggestions.length > 0 ? (
                <ul className="space-y-4">
                  {results.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-xs font-medium">{index + 1}</span>
                      </div>
                      <p className="text-muted-foreground">{suggestion}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No specific suggestions available.</p>
              )}
              
              <div className="mt-6 flex justify-end">
                <Button>
                  <ArrowRight size={16} className="mr-2" />
                  Try Our AI Humanizer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DetectionResults;
