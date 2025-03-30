import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search, AlertCircle, BookOpen, Copy, ExternalLink, Check, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { checkPlagiarism } from '@/services/freeAIService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Source {
  url: string;
  title: string;
  similarity: number;
  matchedText: string;
  sourceType: string;
  publicationDate?: string;
  author?: string;
  highlightRanges?: Array<[number, number]>;
}

interface ParagraphAnalysis {
  paragraph: string;
  originalityScore: number;
  matchingSources: number[];
}

interface PlagiarismResult {
  originalityScore: number;
  plagiarismScore: number;
  sources: Source[];
  summary: string;
  paragraphAnalysis?: ParagraphAnalysis[];
  citationSuggestions?: string[];
}

const PlagiarismChecker = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState<number | null>(null);

  const handleCheck = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to check for plagiarism');
      return;
    }

    setIsLoading(true);
    try {
      const plagiarismResult = await checkPlagiarism(inputText);
      setResult(plagiarismResult);
      toast.success('Plagiarism check complete');
    } catch (error) {
      console.error('Error checking plagiarism:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      
      toast.error('Failed to check plagiarism. Please try again.');
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

  const handleCopyCitation = (index: number) => {
    if (result?.citationSuggestions?.[index]) {
      navigator.clipboard.writeText(result.citationSuggestions[index]);
      setCopiedCitation(index);
      toast.success('Citation copied to clipboard');
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedCitation(null);
      }, 2000);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-primary">Advanced Plagiarism Checker</h3>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-muted-foreground">Free Plagiarism Tool</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
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
            For best results, enter at least 300 characters. Paragraphs separated by blank lines will be analyzed individually.
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

        {/* Results Section */}
        {result && (
          <div className="mt-6 space-y-8">
            {/* Summary Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Analysis Summary</span>
                  <div className={`text-lg font-bold ${getScoreColor(result.originalityScore)}`}>
                    {result.originalityScore}% Original
                  </div>
                </CardTitle>
                <CardDescription>Overall assessment of your text</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Progress value={result.originalityScore} className={`h-2 ${getProgressColor(result.originalityScore)}`} />
                  <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                    <span>Low Originality</span>
                    <span>{getSeverityLabel(result.originalityScore)}</span>
                    <span>High Originality</span>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-sm">
                  {result.summary}
                </div>
              </CardContent>
            </Card>
           
            {/* Tabbed Results */}
            <Tabs defaultValue="sources" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="sources">Matching Sources</TabsTrigger>
                <TabsTrigger value="paragraphs">Paragraph Analysis</TabsTrigger>
                <TabsTrigger value="citations">Citation Suggestions</TabsTrigger>
              </TabsList>
              
              {/* Sources Tab */}
              <TabsContent value="sources" className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Potential Sources ({result.sources.length})</h3>
                {result.sources.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-md">
                    No matching sources were found. Your content appears to be original.
                  </div>
                ) : (
                  result.sources.map((source, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/20 p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{source.title.split('|')[0].trim()}</h4>
                            <div className="flex items-center text-xs text-muted-foreground space-x-2">
                              <Badge variant="outline">{source.sourceType}</Badge>
                              {source.publicationDate && <span>• Published: {formatDate(source.publicationDate)}</span>}
                              {source.author && <span>• Author: {source.author}</span>}
                            </div>
                          </div>
                          <div className={`text-sm font-medium px-2 py-1 rounded ${
                            source.similarity > 70 ? 'bg-red-100 text-red-700' : 
                            source.similarity > 40 ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            {source.similarity}% match
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-blue-600 truncate">
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                            {source.url} <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                      <div className="p-4 border-t">
                        <h5 className="text-xs font-medium mb-2 text-muted-foreground">Matched Content:</h5>
                        <blockquote className="bg-yellow-50 p-3 text-sm rounded border border-yellow-200 italic">
                          "{source.matchedText}"
                        </blockquote>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
              
              {/* Paragraph Analysis Tab */}
              <TabsContent value="paragraphs" className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Paragraph-Level Analysis</h3>
                {!result.paragraphAnalysis || result.paragraphAnalysis.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-md">
                    No paragraph analysis available. Try adding more content with clear paragraph breaks.
                  </div>
                ) : (
                  result.paragraphAnalysis.map((para, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">Paragraph {index + 1}</h4>
                          <div className={`text-sm font-medium ${getScoreColor(para.originalityScore)}`}>
                            {para.originalityScore}% Original
                          </div>
                        </div>
                        <p className="text-sm">{para.paragraph}</p>
                      </div>
                      {para.matchingSources.length > 0 && (
                        <div className="p-3 border-t bg-muted/10">
                          <h5 className="text-xs font-medium mb-2">Matching Sources:</h5>
                          <div className="flex flex-wrap gap-2">
                            {para.matchingSources.map(sourceIndex => (
                              <Badge key={sourceIndex} variant="secondary" className="text-xs">
                                {result.sources[sourceIndex]?.title.split('|')[0].trim().substring(0, 20)}... ({result.sources[sourceIndex]?.similarity}% match)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
              
              {/* Citations Tab */}
              <TabsContent value="citations" className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Citation Suggestions</h3>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md mb-4 flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                  <div className="text-sm text-blue-700">
                    These citations are provided in APA format to help you properly attribute sources if needed. 
                    Always verify source information before academic submission.
                  </div>
                </div>
                
                {!result.citationSuggestions || result.citationSuggestions.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-md">
                    No citation suggestions available. This content appears to be highly original.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {result.citationSuggestions.map((citation, index) => (
                      <div key={index} className="flex items-start justify-between border rounded-lg p-4 bg-card">
                        <div className="text-sm pr-4">{citation}</div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="shrink-0"
                          onClick={() => handleCopyCitation(index)}
                        >
                          {copiedCitation === index ? (
                            <><Check className="h-4 w-4 mr-1" /> Copied</>
                          ) : (
                            <><Copy className="h-4 w-4 mr-1" /> Copy</>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex items-start space-x-3 text-sm bg-blue-50 p-4 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-blue-700">Disclaimer</p>
                <p className="text-blue-600 mt-1">
                  This is a simulated plagiarism check. Results are for demonstration purposes only and should not be considered definitive. For academic or professional use, we recommend verifying with multiple tools and comprehensive checks.
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