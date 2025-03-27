
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ShieldCheck, Bot, RefreshCw, Copy, Check, FileText, BarChart, AlertTriangle, Info, ChevronRight, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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
  const [results, setResults] = useState<{[key: string]: any}>({
    plagiarism: null,
    detection: null,
    humanize: null
  });

  const handleTextChange = (tab: string, value: string) => {
    setText((prev) => ({ ...prev, [tab]: value }));
  };

  const handleSubmit = (tab: string) => {
    // Simulate API call
    setIsLoading((prev) => ({ ...prev, [tab]: true }));
    
    setTimeout(() => {
      let result = null;
      
      // Mock results based on the tab
      if (tab === 'plagiarism') {
        result = {
          originalityScore: 78,
          matches: [
            { source: 'https://example.com/article1', similarity: 15, text: 'Lorem ipsum dolor sit amet' },
            { source: 'https://example.org/content2', similarity: 7, text: 'consectetur adipiscing elit' }
          ]
        };
      } else if (tab === 'detection') {
        result = {
          aiProbability: 73,
          humanProbability: 27,
          patterns: {
            repetitive: 'High',
            complexity: 'Low',
            variability: 'Medium'
          }
        };
      } else if (tab === 'humanize') {
        result = {
          originalText: text.humanize,
          humanizedText: "This is a humanized version of the original text. It maintains the same meaning but uses more natural language patterns, varied sentence structures, and avoids repetitive phrases that are typical of AI-generated content.",
          humanScore: 92
        };
      }
      
      setResults((prev) => ({ ...prev, [tab]: result }));
      setIsLoading((prev) => ({ ...prev, [tab]: false }));
    }, 2000);
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
                </div>
                
                <div className="text-right">
                  <Button 
                    onClick={() => handleSubmit('plagiarism')} 
                    disabled={isLoading.plagiarism || !text.plagiarism.trim()}
                  >
                    {isLoading.plagiarism ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Check Plagiarism'
                    )}
                  </Button>
                </div>
                
                {results.plagiarism && (
                  <PlagiarismResults results={results.plagiarism} />
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
                </div>
                
                <div className="text-right">
                  <Button 
                    onClick={() => handleSubmit('detection')} 
                    disabled={isLoading.detection || !text.detection.trim()}
                  >
                    {isLoading.detection ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      'Detect AI'
                    )}
                  </Button>
                </div>
                
                {results.detection && (
                  <DetectionResults results={results.detection} />
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
                    onClick={() => handleSubmit('humanize')} 
                    disabled={isLoading.humanize || !text.humanize.trim()}
                  >
                    {isLoading.humanize ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Humanizing...
                      </>
                    ) : (
                      'Humanize Text'
                    )}
                  </Button>
                </div>
                
                {results.humanize && (
                  <HumanizeResults results={results.humanize} />
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

const PlagiarismResults = ({ results }: { results: any }) => (
  <div className="mt-8 space-y-6 animate-fade-in">
    <div className="p-4 border rounded-lg bg-muted/30">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Originality Score</h3>
        <div className="text-2xl font-bold">{results.originalityScore}%</div>
      </div>
      
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500"
          style={{ width: `${results.originalityScore}%` }}
        ></div>
      </div>
      
      <div className="mt-2 flex justify-between text-sm text-muted-foreground">
        <span>0% Original</span>
        <span>100% Original</span>
      </div>
    </div>
    
    {results.matches.length > 0 && (
      <div>
        <h3 className="font-semibold text-lg mb-4">Matched Sources ({results.matches.length})</h3>
        <div className="space-y-4">
          {results.matches.map((match: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-500" />
                  <span className="font-medium">Match found</span>
                </div>
                <span className="text-sm font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  {match.similarity}% Similar
                </span>
              </div>
              <div className="mt-3 p-3 bg-muted/30 rounded text-sm">
                "{match.text}"
              </div>
              <div className="mt-3 flex items-center justify-between">
                <a 
                  href={match.source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary flex items-center hover:underline"
                >
                  View Source <ChevronRight size={14} />
                </a>
                <Button variant="outline" size="sm" className="text-xs h-8">
                  Exclude Match
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
    
    <div className="flex justify-end gap-4">
      <Button variant="outline">
        <FileText size={16} className="mr-2" />
        Download Report
      </Button>
      <Button variant="secondary">
        <BarChart size={16} className="mr-2" />
        Detailed Analysis
      </Button>
    </div>
  </div>
);

const DetectionResults = ({ results }: { results: any }) => (
  <div className="mt-8 space-y-6 animate-fade-in">
    <div className={`p-6 rounded-lg border ${
      results.aiProbability > 50 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <div className={`text-lg font-semibold ${
            results.aiProbability > 50 ? 'text-red-700' : 'text-green-700'
          }`}>
            {results.aiProbability > 50 ? 'AI-Generated Content Detected' : 'Human-Written Content Detected'}
          </div>
          <p className={`text-sm ${
            results.aiProbability > 50 ? 'text-red-600' : 'text-green-600'
          }`}>
            This content appears to be {results.aiProbability > 50 ? 'written by AI' : 'written by a human'}.
          </p>
        </div>
        <div className={`text-3xl font-bold ${
          results.aiProbability > 50 ? 'text-red-700' : 'text-green-700'
        }`}>
          {results.aiProbability}%
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">AI Probability</h3>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-red-500"
            style={{ width: `${results.aiProbability}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>0%</span>
          <span>{results.aiProbability}%</span>
        </div>
      </div>
      
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Human Probability</h3>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-green-500"
            style={{ width: `${results.humanProbability}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>0%</span>
          <span>{results.humanProbability}%</span>
        </div>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-4">Pattern Analysis</h3>
      <div className="grid grid-cols-3 gap-4">
        <PatternIndicator 
          label="Repetitive Patterns" 
          value={results.patterns.repetitive} 
          color={results.patterns.repetitive === 'High' ? 'red' : results.patterns.repetitive === 'Medium' ? 'yellow' : 'green'}
        />
        <PatternIndicator 
          label="Complexity" 
          value={results.patterns.complexity} 
          color={results.patterns.complexity === 'Low' ? 'red' : results.patterns.complexity === 'Medium' ? 'yellow' : 'green'} 
        />
        <PatternIndicator 
          label="Variability" 
          value={results.patterns.variability} 
          color={results.patterns.variability === 'Low' ? 'red' : results.patterns.variability === 'Medium' ? 'yellow' : 'green'} 
        />
      </div>
    </div>
    
    <div className="flex justify-end gap-4">
      <Button variant="outline">
        <FileText size={16} className="mr-2" />
        Download Report
      </Button>
      <Button variant="secondary">
        <RefreshCw size={16} className="mr-2" />
        Humanize Content
      </Button>
    </div>
  </div>
);

const PatternIndicator = ({ label, value, color }: { label: string, value: string, color: string }) => {
  const getColorClass = () => {
    switch (color) {
      case 'red': return 'bg-red-100 text-red-700';
      case 'yellow': return 'bg-yellow-100 text-yellow-700';
      case 'green': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <div className="p-3 border rounded-lg">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="flex justify-between items-center">
        <span className="font-medium">{value}</span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getColorClass()}`}>
          {value}
        </span>
      </div>
    </div>
  );
};

const HumanizeResults = ({ results }: { results: any }) => (
  <div className="mt-8 space-y-6 animate-fade-in">
    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Check size={18} className="text-green-600" />
          <span className="font-medium text-green-800">Successfully Humanized</span>
        </div>
        <div className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
          {results.humanScore}% Human Score
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Original (AI) Text</h3>
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            <Copy size={14} className="mr-1" /> Copy
          </Button>
        </div>
        <div className="p-4 border rounded-lg bg-muted/30 min-h-[200px] text-sm">
          {results.originalText}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Humanized Text</h3>
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            <Copy size={14} className="mr-1" /> Copy
          </Button>
        </div>
        <div className="p-4 border border-green-200 rounded-lg bg-green-50 min-h-[200px] text-sm">
          {results.humanizedText}
        </div>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg bg-blue-50 border-blue-200 flex gap-3">
      <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
      <div className="text-sm text-blue-800">
        <p className="font-medium mb-1">Tips for using humanized content</p>
        <p>The humanized text maintains the original meaning while using more natural language patterns. 
        It's designed to pass AI detection tools while preserving clarity and coherence.</p>
      </div>
    </div>
    
    <div className="flex justify-end gap-4">
      <Button variant="outline">
        <FileText size={16} className="mr-2" />
        Download Text
      </Button>
      <Button variant="secondary">
        <Bot size={16} className="mr-2" />
        Verify AI Detection
      </Button>
    </div>
  </div>
);

export default Dashboard;
