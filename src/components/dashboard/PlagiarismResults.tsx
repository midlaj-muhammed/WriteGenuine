
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  ChevronRight, 
  FileText, 
  BarChart, 
  Shield, 
  ExternalLink,
  Copy,
  Check,
  Globe,
  BookOpen
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlagiarismSource } from '@/lib/gemini-service';
import { Badge } from '@/components/ui/badge';

interface PlagiarismResultsProps {
  results: {
    score: number;
    details: string;
    suggestions?: string[];
    sources?: PlagiarismSource[];
  };
}

const PlagiarismResults = ({ results }: PlagiarismResultsProps) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopySource = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Text copied",
      description: "Source text has been copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Highly Original';
    if (score >= 60) return 'Mostly Original';
    if (score >= 40) return 'Partially Original';
    return 'Low Originality';
  };

  // Format URL for display
  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
    } catch (e) {
      return url;
    }
  };

  // Ensure sources are properly formatted
  const validSources = React.useMemo(() => {
    if (!results.sources || !Array.isArray(results.sources)) {
      return [];
    }
    
    return results.sources
      .filter(source => 
        source && 
        typeof source === 'object' && 
        source.text && 
        source.url && 
        typeof source.similarity === 'number'
      )
      .map(source => ({
        ...source,
        title: source.title || source.url.split('/').pop() || 'Unknown Source',
        text: source.text || 'No matching text available',
        similarity: source.similarity || 0
      }));
  }, [results.sources]);

  // Check if a URL is valid
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="mt-8 space-y-6 animate-fade-in">
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Sources ({validSources.length})</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Originality Score</h3>
                  <p className="text-muted-foreground">How original is this content?</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-3xl font-bold ${getScoreColor(results.score)}`}>
                    {results.score}%
                  </span>
                  <span className={`text-sm ${getScoreColor(results.score)}`}>
                    {getScoreMessage(results.score)}
                  </span>
                </div>
              </div>
              
              <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getScoreBgColor(results.score)}`}
                  style={{ width: `${results.score}%` }}
                ></div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Analysis</h4>
                <p className="text-muted-foreground">{results.details}</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center space-x-2">
              <Shield className="text-primary h-5 w-5" />
              <span className="text-sm">
                {validSources.length > 0 
                  ? `${validSources.length} potential sources identified` 
                  : 'No matching sources found'}
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
        
        <TabsContent value="sources" className="space-y-4">
          {validSources.length > 0 ? (
            validSources.map((source, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 border-b bg-muted/20">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {source.url.includes('jstor') ? (
                          <BookOpen size={16} className="text-blue-600" />
                        ) : (
                          <Globe size={16} className="text-blue-600" /> 
                        )}
                        <h3 className="font-medium">{source.title}</h3>
                      </div>
                      <Badge className={`px-2 py-1 text-xs font-medium ${
                        source.similarity > 75 ? 'bg-red-100 text-red-800' : 
                        source.similarity > 50 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {source.similarity}% Match
                      </Badge>
                    </div>
                    
                    {isValidUrl(source.url) ? (
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:underline flex items-center mt-1"
                      >
                        {formatUrl(source.url)}
                        <ExternalLink size={12} className="ml-1" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground mt-1">{source.url}</span>
                    )}
                  </div>
                  
                  <div className="p-4 relative bg-muted/5 border-l-4 border-yellow-500">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 absolute top-2 right-2"
                      onClick={() => handleCopySource(source.text)}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </Button>
                    <p className="text-sm pr-8">{source.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-medium text-lg">No matching sources found</h3>
              <p className="text-muted-foreground">Your content appears to be original.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Improvement Suggestions</h3>
              {results.suggestions && results.suggestions.length > 0 ? (
                <ul className="space-y-3">
                  {results.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-xs text-primary font-medium">{index + 1}</span>
                      </div>
                      <p>{suggestion}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No specific suggestions available.</p>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button>
              <BarChart size={16} className="mr-2" />
              Get Detailed Analysis
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlagiarismResults;
