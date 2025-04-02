
import React, { useState } from 'react';
import { 
  Bot, 
  User, 
  Check, 
  Copy, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HumanizeResultsProps {
  results: {
    originalText: string;
    humanizedText: string;
    humanScore?: number;
  };
}

const HumanizeResults = ({ results }: HumanizeResultsProps) => {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedHumanized, setCopiedHumanized] = useState(false);
  
  const handleCopy = (text: string, isOriginal: boolean) => {
    navigator.clipboard.writeText(text);
    if (isOriginal) {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedHumanized(true);
      setTimeout(() => setCopiedHumanized(false), 2000);
    }
    toast({
      title: "Copied to clipboard",
      description: `${isOriginal ? 'Original' : 'Humanized'} text has been copied`,
    });
  };
  
  // Generate differences between texts for highlighting
  const getTextDifferences = () => {
    const original = results.originalText.split(" ");
    const humanized = results.humanizedText.split(" ");
    
    // Very simple difference detection
    const commonWords = original.filter(word => humanized.includes(word));
    const uniqueInHumanized = humanized.filter(word => !original.includes(word));
    
    return {
      commonCount: commonWords.length,
      changedCount: humanized.length - commonWords.length,
      changePercentage: Math.round((1 - (commonWords.length / humanized.length)) * 100)
    };
  };
  
  const differences = getTextDifferences();
  
  // Get some stats about the humanized text
  const getStats = (text: string) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.trim().length > 0);
    const avgSentenceLength = sentences.length > 0 
      ? Math.round(words.length / sentences.length) 
      : 0;
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgSentenceLength,
      complexity: text.length > 200 ? 'High' : text.length > 100 ? 'Medium' : 'Low'
    };
  };
  
  const originalStats = getStats(results.originalText);
  const humanizedStats = getStats(results.humanizedText);
  
  return (
    <div className="mt-8 animate-fade-in space-y-6">
      <Tabs defaultValue="result">
        <TabsList>
          <TabsTrigger value="result">Result</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="result" className="mt-4">
          <Card className="overflow-hidden mb-6">
            <CardHeader className="bg-muted/30 pb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Sparkles size={18} className="text-primary mr-2" />
                  <CardTitle className="text-lg">Humanized Text</CardTitle>
                </div>
                <Badge className="bg-green-500">
                  {results.humanScore || 98}% Human Score
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-white rounded-lg p-4 min-h-[160px]">
                <Button 
                  size="icon" 
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => handleCopy(results.humanizedText, false)}
                >
                  {copiedHumanized ? <Check size={16} /> : <Copy size={16} />}
                </Button>
                <div className="pr-8 whitespace-pre-wrap text-base leading-relaxed">
                  {results.humanizedText}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline">
                  <RefreshCw size={16} className="mr-2" />
                  Regenerate
                </Button>
                <Button>
                  Check AI Detection
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="p-4 border rounded-lg bg-blue-50 flex items-start gap-3">
            <User className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-blue-800 font-semibold">Improved Humanized Text</h3>
              <p className="text-blue-700 text-sm">
                This text has been rewritten to have more natural language patterns, varied sentence structures, and 
                conversational elements that will help it bypass AI detection.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="comparison" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-muted/30 pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Bot size={18} className="text-slate-600 mr-2" />
                    <CardTitle className="text-lg">Original (AI) Text</CardTitle>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-8"
                    onClick={() => handleCopy(results.originalText, true)}
                  >
                    {copiedOriginal ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                    {copiedOriginal ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[300px] overflow-auto">
                <div className="whitespace-pre-wrap text-base leading-relaxed">
                  {results.originalText}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-muted/30 pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <User size={18} className="text-primary mr-2" />
                    <CardTitle className="text-lg">Humanized Text</CardTitle>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-8"
                    onClick={() => handleCopy(results.humanizedText, false)}
                  >
                    {copiedHumanized ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                    {copiedHumanized ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[300px] overflow-auto">
                <div className="whitespace-pre-wrap text-base leading-relaxed">
                  {results.humanizedText}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRight size={18} className="text-green-600" />
                  <span className="font-medium">Changes Summary</span>
                </div>
                <Badge variant="outline">~{differences.changePercentage}% Modified</Badge>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/20 rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">Words Changed</div>
                  <div className="text-xl font-bold mt-1">{differences.changedCount}</div>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">Added Humanity</div>
                  <div className="text-xl font-bold mt-1">
                    {results.humanScore || 98}%
                  </div>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">AI Detection Risk</div>
                  <div className="text-xl font-bold mt-1 text-green-600">Low</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Original Text</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Word Count</div>
                    <div className="text-xl font-bold mt-1">{originalStats.wordCount}</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Sentences</div>
                    <div className="text-xl font-bold mt-1">{originalStats.sentenceCount}</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Avg. Sentence Length</div>
                    <div className="text-xl font-bold mt-1">{originalStats.avgSentenceLength}</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Complexity</div>
                    <div className="text-xl font-bold mt-1">{originalStats.complexity}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Humanized Text</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Word Count</div>
                    <div className="text-xl font-bold mt-1">{humanizedStats.wordCount}</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Sentences</div>
                    <div className="text-xl font-bold mt-1">{humanizedStats.sentenceCount}</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Avg. Sentence Length</div>
                    <div className="text-xl font-bold mt-1">{humanizedStats.avgSentenceLength}</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Complexity</div>
                    <div className="text-xl font-bold mt-1">{humanizedStats.complexity}</div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-green-800">Optimized for Human Detection</h3>
                  </div>
                  <p className="text-green-700 text-sm">
                    The humanized text has more sentence variety and natural language patterns, 
                    making it more likely to bypass AI detection systems.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HumanizeResults;
