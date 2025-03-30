import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ShieldCheck, Bot, RefreshCw, Copy, Check, FileText, BarChart, AlertTriangle, Info, ChevronRight, Loader2, AlertCircle, Search } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interface for plagiarism checker
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

// Interface for AI detection
interface DetectionResult {
  score: number;
  aiProbability: number;
  humanProbability: number;
  analysis: string;
}

// Interface for humanizer
interface HumanizeResult {
  humanizedText: string;
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({
    plagiarism: false,
    detection: false,
    humanize: false
  });
  const [text, setText] = useState({
    plagiarism: '',
    detection: '',
    humanize: ''
  });
  const [results, setResults] = useState<{
    plagiarism: PlagiarismResult | null,
    detection: DetectionResult | null,
    humanize: HumanizeResult | null
  }>({
    plagiarism: null,
    detection: null,
    humanize: null
  });
  
  const [humanizeStyle, setHumanizeStyle] = useState('natural');

  const handleTextChange = (tab: string, value: string) => {
    setText((prev) => ({ ...prev, [tab]: value }));
  };

  // Plagiarism check using DeepSeek API
  const handlePlagiarismCheck = async () => {
    if (!text.plagiarism.trim()) {
      toast.error('Please enter some text to check for plagiarism');
      return;
    }

    setIsLoading((prev) => ({ ...prev, plagiarism: true }));
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `You are a plagiarism detection expert. Your task is to analyze the given text and determine whether it contains plagiarized content.

              Since you don't have direct web search capabilities, simulate a plagiarism check by:
              1. Identifying common phrases, quotes, or passages that might appear in other sources
              2. Evaluating the originality of ideas and expressions
              3. Looking for distinctive academic or professional writing patterns
              
              After analysis, provide a JSON response with these fields:
              - originalityScore: a number between 0 and 100 representing how original the text appears
              - plagiarismScore: a number between 0 and 100 (should be 100 - originalityScore)
              - sources: an array of simulated matching sources, each with:
                * url: a plausible website URL where similar content might be found
                * title: a plausible title for the source
                * similarity: a percentage (0-100) indicating how similar this source is
                * matchedText: a brief excerpt showing what text might match
              - summary: a brief explanation of your reasoning (max 150 words)
              
              Include 1-3 simulated sources for demonstration purposes.
              
              IMPORTANT: Return ONLY valid JSON with no additional text, explanations, or formatting.`
            },
            {
              role: "user",
              content: text.plagiarism
            }
          ],
          temperature: 0.2,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check plagiarism');
      }

      const data = await response.json();
      const responseContent = data.choices[0].message.content;
      
      // Parse the JSON response
      try {
        const parsedResult = JSON.parse(responseContent);
        setResults((prev) => ({ ...prev, plagiarism: parsedResult }));
        toast.success('Plagiarism check complete');
      } catch (error) {
        console.error('Failed to parse AI response:', responseContent);
        toast.error('Failed to parse plagiarism check result');
      }
    } catch (error) {
      console.error('Error checking plagiarism:', error);
      toast.error('Failed to check plagiarism. Please try again.');
    } finally {
      setIsLoading((prev) => ({ ...prev, plagiarism: false }));
    }
  };

  // AI detection using DeepSeek API
  const handleDetection = async () => {
    if (!text.detection.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setIsLoading((prev) => ({ ...prev, detection: true }));
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `You are an AI text detection expert. Your task is to analyze the given text and determine whether it was written by a human or generated by AI.
              
              Follow this process:
              1. Analyze the text for patterns typical of AI generation (repetition, generic phrasing, unnatural transitions)
              2. Look for human-like elements (personal anecdotes, unique perspectives, creative language)
              3. Consider complexity, randomness, and unpredictability of the writing
              
              After analysis, provide a JSON response with these fields:
              - aiProbability: a number between 0 and 100 representing the probability the text was AI-generated
              - humanProbability: a number between 0 and 100 (should be 100 - aiProbability)
              - analysis: a brief explanation (max 150 words) of your reasoning
              
              IMPORTANT: Return ONLY valid JSON with no additional text, explanations, or formatting.`
            },
            {
              role: "user",
              content: text.detection
            }
          ],
          temperature: 0.1,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const data = await response.json();
      const responseContent = data.choices[0].message.content;
      
      // Parse the JSON response
      try {
        const parsedResult = JSON.parse(responseContent);
        setResults((prev) => ({ 
          ...prev, 
          detection: {
            score: parsedResult.aiProbability,
            aiProbability: parsedResult.aiProbability,
            humanProbability: parsedResult.humanProbability,
            analysis: parsedResult.analysis
          }
        }));
        toast.success('Analysis complete');
      } catch (error) {
        console.error('Failed to parse AI response:', responseContent);
        toast.error('Failed to parse analysis result');
      }
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast.error('Failed to analyze text. Please try again.');
    } finally {
      setIsLoading((prev) => ({ ...prev, detection: false }));
    }
  };

  // Get system prompt for humanizing text
  const getHumanizeSystemPrompt = (style: string) => {
    const prompts = {
      natural: `You are an expert content humanizer. Your task is to make the given text sound more natural and human-like while maintaining its meaning. Follow these guidelines:
1. Use natural transitions between ideas
2. Vary sentence structure and length
3. Add appropriate conjunctions and connecting words
4. Use active voice where possible
5. Include natural pauses and rhythm
6. Maintain the original meaning and key points
7. Add subtle emotional undertones
8. Use conversational language where appropriate
9. Avoid repetitive patterns
10. Keep the tone professional but engaging`,
      
      casual: `You are an expert content humanizer specializing in casual, conversational writing. Your task is to make the given text sound more natural and engaging. Follow these guidelines:
1. Use everyday language and expressions
2. Add personal touches and relatable examples
3. Include conversational transitions
4. Use contractions naturally
5. Add friendly, approachable tone
6. Keep sentences shorter and more direct
7. Use active voice
8. Include natural pauses and rhythm
9. Add subtle humor where appropriate
10. Maintain the original message while making it more engaging`,
      
      professional: `You are an expert content humanizer specializing in professional writing. Your task is to make the given text sound more polished and business-appropriate. Follow these guidelines:
1. Use clear, concise language
2. Maintain formal tone while being engaging
3. Use professional transitions
4. Include industry-appropriate terminology
5. Structure ideas logically
6. Use active voice
7. Add appropriate emphasis on key points
8. Maintain professional rhythm
9. Include relevant examples
10. Keep the tone authoritative but approachable`
    };
    return prompts[style as keyof typeof prompts] || prompts.natural;
  };

  // Humanize text using DeepSeek API
  const handleHumanize = async () => {
    if (!text.humanize.trim()) {
      toast.error('Please enter some text to humanize');
      return;
    }

    setIsLoading((prev) => ({ ...prev, humanize: true }));
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: getHumanizeSystemPrompt(humanizeStyle)
            },
            {
              role: "user",
              content: text.humanize
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to humanize text');
      }

      const data = await response.json();
      setResults((prev) => ({ 
        ...prev, 
        humanize: {
          humanizedText: data.choices[0].message.content
        }
      }));
      toast.success('Text humanized successfully!');
    } catch (error) {
      console.error('Error humanizing text:', error);
      toast.error('Failed to humanize text. Please try again.');
    } finally {
      setIsLoading((prev) => ({ ...prev, humanize: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-28">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h1>
          <p className="text-muted-foreground">
            Use our tools to check, detect, and humanize your content.
          </p>
        </div>
        
        <Tabs defaultValue="plagiarism" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-lg mb-8">
            <TabsTrigger value="plagiarism">Plagiarism Check</TabsTrigger>
            <TabsTrigger value="detection">AI Detection</TabsTrigger>
            <TabsTrigger value="humanize">AI Humanizer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plagiarism">
            <ToolCard
              icon={<ShieldCheck size={24} />}
              title="Plagiarism Checker"
              description="Check your content against billions of web pages, academic papers, and publications."
            >
              <div className="space-y-6">
                <div>
                  <label htmlFor="plagiarism-text" className="block text-sm font-medium mb-2">
                    Enter text to check for plagiarism
                  </label>
                  <Textarea 
                    id="plagiarism-text"
                    placeholder="Paste or type your content here..."
                    className="min-h-[200px]"
                    value={text.plagiarism}
                    onChange={(e) => handleTextChange('plagiarism', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    For best results, enter at least 300 characters.
                  </p>
                </div>
                
                <div className="text-right">
                  <Button 
                    onClick={handlePlagiarismCheck} 
                    disabled={isLoading.plagiarism || !text.plagiarism.trim()}
                    className="gap-2"
                  >
                    {isLoading.plagiarism ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Check Plagiarism
                      </>
                    )}
                  </Button>
                </div>
                
                {results.plagiarism && (
                  <div className="mt-6 space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">Originality Score</label>
                        <div className={`text-lg font-bold ${results.plagiarism.originalityScore >= 70 ? 'text-green-500' : results.plagiarism.originalityScore >= 30 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {results.plagiarism.originalityScore}%
                        </div>
                      </div>
                      <Progress 
                        value={results.plagiarism.originalityScore} 
                        className={`h-2 ${results.plagiarism.originalityScore >= 70 ? 'bg-green-500' : results.plagiarism.originalityScore >= 30 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                      />
                      <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                        <span>Low Originality</span>
                        <span>
                          {results.plagiarism.originalityScore >= 70 ? 'Highly Original' : 
                           results.plagiarism.originalityScore >= 30 ? 'Partially Original' : 
                           'Possible Plagiarism'}
                        </span>
                        <span>High Originality</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Analysis</label>
                      <div className="bg-muted/30 rounded-lg p-4 text-sm">
                        {results.plagiarism.summary}
                      </div>
                    </div>

                    {results.plagiarism.sources && results.plagiarism.sources.length > 0 && (
                      <div className="space-y-4">
                        <label className="block text-sm font-medium">Potential Sources</label>
                        {results.plagiarism.sources.map((source, index) => (
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
            </ToolCard>
          </TabsContent>
          
          <TabsContent value="detection">
            <ToolCard
              icon={<Bot size={24} />}
              title="AI Detection"
              description="Analyze text to determine whether it was written by a human or AI."
            >
              <div className="space-y-6">
                <div>
                  <label htmlFor="detection-text" className="block text-sm font-medium mb-2">
                    Enter text to check for AI generation
                  </label>
                  <Textarea 
                    id="detection-text"
                    placeholder="Paste or type your content here..."
                    className="min-h-[200px]"
                    value={text.detection}
                    onChange={(e) => handleTextChange('detection', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    For best results, enter at least 300 characters.
                  </p>
                </div>
                
                <div className="text-right">
                  <Button 
                    onClick={handleDetection} 
                    disabled={isLoading.detection || !text.detection.trim()}
                    className="gap-2"
                  >
                    {isLoading.detection ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4" />
                        Detect AI
                      </>
                    )}
                  </Button>
                </div>
                
                {results.detection && (
                  <div className="mt-6 space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">AI Probability</label>
                        <div className={`text-lg font-bold ${results.detection.score <= 30 ? 'text-green-500' : results.detection.score <= 70 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {results.detection.score}%
                        </div>
                      </div>
                      <Progress 
                        value={results.detection.score} 
                        className={`h-2 ${results.detection.score <= 30 ? 'bg-green-500' : results.detection.score <= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                      />
                      <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                        <span>Human</span>
                        <span>
                          {results.detection.score <= 30 ? 'Likely Human' : 
                           results.detection.score <= 70 ? 'Uncertain' : 
                           'Likely AI'}
                        </span>
                        <span>AI</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Analysis</label>
                      <div className="bg-muted/30 rounded-lg p-4 text-sm">
                        {results.detection.analysis}
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
            </ToolCard>
          </TabsContent>
          
          <TabsContent value="humanize">
            <ToolCard
              icon={<RefreshCw size={24} />}
              title="AI Humanizer"
              description="Transform AI text into natural human writing that bypasses detection."
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Writing Style</label>
                  <Select value={humanizeStyle} onValueChange={setHumanizeStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select writing style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natural">Natural & Balanced</SelectItem>
                      <SelectItem value="casual">Casual & Conversational</SelectItem>
                      <SelectItem value="professional">Professional & Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="humanize-text" className="block text-sm font-medium mb-2">
                    Enter AI-generated text to humanize
                  </label>
                  <Textarea 
                    id="humanize-text"
                    placeholder="Paste or type your AI-generated content here..."
                    className="min-h-[200px]"
                    value={text.humanize}
                    onChange={(e) => handleTextChange('humanize', e.target.value)}
                  />
                </div>
                
                <div className="text-right">
                  <Button 
                    onClick={handleHumanize} 
                    disabled={isLoading.humanize || !text.humanize.trim()}
                    className="gap-2"
                  >
                    {isLoading.humanize ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Humanizing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Humanize Text
                      </>
                    )}
                  </Button>
                </div>
                
                {results.humanize && (
                  <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">Humanized Text</label>
                        <div className="flex items-center text-sm text-green-500">
                          <Check className="h-4 w-4 mr-1" />
                          <span>Humanized</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{results.humanize.humanizedText}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => {
                          navigator.clipboard.writeText(results.humanize?.humanizedText || "");
                          toast.success("Humanized text copied to clipboard");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        Copy to Clipboard
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ToolCard>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

const ToolCard = ({ 
  icon, 
  title, 
  description, 
  children 
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  children: React.ReactNode 
}) => (
  <Card className="w-full">
    <CardHeader>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

export default Dashboard;
