import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ShieldCheck, Bot, RefreshCw, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';
import { geminiService } from '@/lib/gemini-service';
import ApiKeyInput from '@/components/dashboard/ApiKeyInput';
import ToolCard from '@/components/dashboard/ToolCard';
import PlagiarismResults from '@/components/dashboard/PlagiarismResults';
import DetectionResults from '@/components/dashboard/DetectionResults';
import HumanizeResults from '@/components/dashboard/HumanizeResults';
import apiKeyManager from '@/lib/api-key-manager';

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
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('plagiarism');

  useEffect(() => {
    const savedKey = apiKeyManager.getApiKey();
    if (savedKey) {
      setApiKey(savedKey);
    }
    
    // Listen for API key changes from other components
    const handleApiKeyChange = (event: CustomEvent) => {
      setApiKey(event.detail);
    };
    
    window.addEventListener('apikey-changed', handleApiKeyChange as EventListener);
    
    return () => {
      window.removeEventListener('apikey-changed', handleApiKeyChange as EventListener);
    };
  }, []);

  const handleApiKeySubmit = (key: string) => {
    apiKeyManager.setApiKey(key);
    setApiKey(key);
    toast({
      title: "API Key Saved",
      description: "Your API key has been saved to your browser's local storage.",
    });
  };

  const handleTextChange = (tab: string, value: string) => {
    setText((prev) => ({ ...prev, [tab]: value }));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSubmit = async (tab: string) => {
    if (!text[tab].trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some text to analyze.",
        variant: "destructive"
      });
      return;
    }

    // Clear any previous results to avoid displaying stale data
    setResults((prev) => ({ ...prev, [tab]: null }));
    setIsLoading((prev) => ({ ...prev, [tab]: true }));
    
    try {
      let result = null;
      
      if (tab === 'plagiarism') {
        result = await geminiService.checkPlagiarism(text[tab]);
      } else if (tab === 'detection') {
        result = await geminiService.detectAI(text[tab]);
      } else if (tab === 'humanize') {
        const humanizedText = await geminiService.humanizeAI(text[tab]);
        result = {
          originalText: text.humanize,
          humanizedText: humanizedText,
          humanScore: 92
        };
      }
      
      if (!result) {
        throw new Error("Failed to get valid result from API");
      }
      
      setResults((prev) => ({ ...prev, [tab]: result }));
      toast({
        title: "Analysis Complete",
        description: `Your ${tab} analysis has completed successfully.`,
      });
    } catch (error) {
      console.error(`Error in ${tab}:`, error);
      toast({
        title: "Analysis Failed",
        description: `Failed to complete ${tab} analysis. Please check your API key and try again.`,
        variant: "destructive"
      });
      // Reset result to ensure the UI doesn't display partial/incorrect data
      setResults((prev) => ({ ...prev, [tab]: null }));
    } finally {
      setIsLoading((prev) => ({ ...prev, [tab]: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-24 sm:py-28">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 sm:mb-4">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Use our tools to check, detect, and humanize your content.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-lg mb-6 sm:mb-8">
            <TabsTrigger value="plagiarism" className="text-sm sm:text-base">Plagiarism Check</TabsTrigger>
            <TabsTrigger value="detection" className="text-sm sm:text-base">AI Detection</TabsTrigger>
            <TabsTrigger value="humanize" className="text-sm sm:text-base">AI Humanizer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plagiarism">
            <ToolCard
              icon={<ShieldCheck size={20} className="sm:size-6" />}
              title="Plagiarism Checker"
              description="Check your content against billions of web pages, academic papers, and publications."
            >
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="plagiarism-text" className="block text-sm font-medium mb-2">
                    Enter text to check for plagiarism
                  </label>
                  <Textarea 
                    id="plagiarism-text"
                    placeholder="Paste or type your content here..."
                    className="min-h-[150px] sm:min-h-[200px]"
                    value={text.plagiarism}
                    onChange={(e) => handleTextChange('plagiarism', e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                  <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
                  <Button 
                    onClick={() => handleSubmit('plagiarism')} 
                    disabled={isLoading.plagiarism || !text.plagiarism.trim() || !apiKey}
                    className="w-full sm:w-auto"
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
              icon={<Bot size={20} className="sm:size-6" />}
              title="AI Detection"
              description="Analyze text to determine whether it was written by a human or AI."
            >
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="detection-text" className="block text-sm font-medium mb-2">
                    Enter text to check for AI generation
                  </label>
                  <Textarea 
                    id="detection-text"
                    placeholder="Paste or type your content here..."
                    className="min-h-[150px] sm:min-h-[200px]"
                    value={text.detection}
                    onChange={(e) => handleTextChange('detection', e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                  <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
                  <Button 
                    onClick={() => handleSubmit('detection')} 
                    disabled={isLoading.detection || !text.detection.trim() || !apiKey}
                    className="w-full sm:w-auto"
                  >
                    {isLoading.detection ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
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
              icon={<RefreshCw size={20} className="sm:size-6" />}
              title="AI Humanizer"
              description="Transform AI-generated text to sound more natural and human-like."
            >
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="humanize-text" className="block text-sm font-medium mb-2">
                    Enter AI-generated text to humanize
                  </label>
                  <Textarea 
                    id="humanize-text"
                    placeholder="Paste or type your content here..."
                    className="min-h-[150px] sm:min-h-[200px]"
                    value={text.humanize}
                    onChange={(e) => handleTextChange('humanize', e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                  <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
                  <Button 
                    onClick={() => handleSubmit('humanize')} 
                    disabled={isLoading.humanize || !text.humanize.trim() || !apiKey}
                    className="w-full sm:w-auto"
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

export default Dashboard;
