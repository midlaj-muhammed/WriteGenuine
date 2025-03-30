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

  // Plagiarism check using Google Gemini API
  const handlePlagiarismCheck = async () => {
    if (!text.plagiarism.trim()) {
      toast.error('Please enter some text to check for plagiarism');
      return;
    }

    setIsLoading((prev) => ({ ...prev, plagiarism: true }));
    try {
      // Check if API key is available
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        toast.error('API key is missing. Please add VITE_GEMINI_API_KEY to your .env file');
        return;
      }
      
      // Log that we're using the API key (without revealing it)
      console.log('Using Gemini API key (starts with):', apiKey.substring(0, 5) + '...');
      
      // Add timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const prompt = `You are analyzing text for plagiarism. Please evaluate the following text and provide:
      
      1. An originality score (0-100)
      2. A plagiarism score (0-100)
      3. A brief summary of your analysis
      4. 1-2 potential matching sources
      
      FORMAT YOUR RESPONSE AS JSON with these fields:
      - originalityScore: number
      - plagiarismScore: number
      - summary: string
      - sources: array of objects with url, title, similarity, and matchedText
      
      DO NOT use markdown formatting. Return only the JSON object.
      
      Text to analyze:
      ${text.plagiarism}`;

      console.log('Sending request to Gemini API for plagiarism check...');
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
            topP: 0.8,
            safetySettings: [
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_ONLY_HIGH"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_ONLY_HIGH"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_ONLY_HIGH"
              },
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_ONLY_HIGH"
              }
            ]
          },
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorBody = await response.text().catch(() => null);
        console.error('API response error:', response.status, errorBody);
        throw new Error(`API responded with status ${response.status}: ${errorBody || 'No error body'}`);
      }

      const data = await response.json();
      console.log('Received response from Gemini API:', data);
      
      if (!data || !data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('Invalid API response structure:', data);
        throw new Error('API response format is unexpected');
      }
      
      const responseContent = data.candidates[0].content.parts[0].text;
      console.log('Raw plagiarism check API response:', responseContent);
      
      // Parse the JSON response
      try {
        // Extract JSON from the response if it's wrapped in markdown code blocks
        let jsonContent = responseContent;
        
        // Try different patterns to extract JSON
        const jsonBlockPattern = /```(?:json)?\s*([\s\S]*?)\s*```/;
        const match = responseContent.match(jsonBlockPattern);
        if (match && match[1]) {
          jsonContent = match[1].trim();
          console.log('Extracted JSON from code block');
        }
        
        // Clean the content further if needed
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        
        // Attempt to parse the JSON
        let parsedResult;
        try {
          parsedResult = JSON.parse(jsonContent);
          console.log('Successfully parsed JSON:', parsedResult);
        } catch (parseError) {
          console.error('JSON parse error for content:', jsonContent);
          console.error('Parse error:', parseError);
          
          // Try to fix common JSON issues and retry parsing
          const fixedJson = jsonContent
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure property names are quoted
            .replace(/'/g, '"'); // Replace single quotes with double quotes
          
          console.log('Attempting to parse fixed JSON:', fixedJson);
          parsedResult = JSON.parse(fixedJson);
        }
        
        // Validate the parsed result has the expected properties
        if (!parsedResult) {
          throw new Error('Failed to parse result into JSON');
        }
        
        // Create a valid result object with defaults for missing fields
        const validatedResult = {
          originalityScore: parsedResult.originalityScore || 0,
          plagiarismScore: parsedResult.plagiarismScore || (100 - (parsedResult.originalityScore || 0)),
          sources: Array.isArray(parsedResult.sources) ? parsedResult.sources : [],
          summary: parsedResult.summary || 'No analysis provided'
        };
        
        setResults((prev) => ({ ...prev, plagiarism: validatedResult }));
        toast.success('Plagiarism check complete');
      } catch (error) {
        console.error('Failed to parse AI response:', error);
        console.error('Raw content:', responseContent);
        
        // Attempt to create a fallback result if parsing fails
        try {
          // Extract just the summary using regex if possible
          const summaryMatch = responseContent.match(/summary["']?\s*:\s*["']([^"']+)["']/i);
          const summary = summaryMatch ? summaryMatch[1] : 'Unable to extract analysis from response';
          
          // Create a fallback result
          const fallbackResult = {
            originalityScore: 50, // Default to 50%
            plagiarismScore: 50,
            sources: [],
            summary: summary
          };
          
          setResults((prev) => ({ ...prev, plagiarism: fallbackResult }));
          toast.success('Plagiarism check complete (with parsing limitations)');
        } catch (fallbackError) {
          // Try a different approach with a simpler prompt
          console.log('Trying fallback approach with simpler prompt...');
          try {
            setIsLoading((prev) => ({ ...prev, plagiarism: true }));
            
            const fallbackPrompt = `Analyze this text for originality. Return only two numbers: 
            1. Originality score (0-100)
            2. Brief summary (1 sentence)
            
            Text: ${text.plagiarism.substring(0, 1000)}`; // Limit text length
            
            const fallbackResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: fallbackPrompt }] }],
                generationConfig: {
                  temperature: 0.1,
                  maxOutputTokens: 100,
                }
              })
            });
            
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              const fallbackText = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || '';
              
              // Extract score using regex
              const scoreMatch = fallbackText.match(/(\d{1,3})/);
              const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 50;
              
              // Create ultra-simplified result
              const ultraFallbackResult = {
                originalityScore: score,
                plagiarismScore: 100 - score,
                sources: [],
                summary: fallbackText.replace(/^\d{1,3}[.,\s]*/, '').trim() || 'Analysis completed with limited information'
              };
              
              setResults((prev) => ({ ...prev, plagiarism: ultraFallbackResult }));
              toast.success('Basic plagiarism check complete');
            } else {
              toast.error('Failed to check plagiarism. Please try again with different text');
            }
          } catch (ultraFallbackError) {
            console.error('Even fallback approach failed:', ultraFallbackError);
            toast.error('Failed to check plagiarism. Please try again with different text');
          } finally {
            setIsLoading((prev) => ({ ...prev, plagiarism: false }));
          }
        }
      }
    } catch (error: any) {
      console.error('Error checking plagiarism:', error);
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please try again');
      } else if (error.message?.includes('API key')) {
        toast.error('API key issue: Please check your Google Gemini API key');
      } else if (error.message?.includes('status 401') || error.message?.includes('status 403')) {
        toast.error('Authentication failed: Please check your Google Gemini API key');
      } else if (error.message?.includes('status 429')) {
        toast.error('API rate limit exceeded. Please try again later');
      } else if (error.message?.includes('safety settings')) {
        toast.error('Content was flagged by safety filters. Try different text');
      } else {
        toast.error('Failed to check plagiarism. Please try again with different text');
      }
    } finally {
      setIsLoading((prev) => ({ ...prev, plagiarism: false }));
    }
  };

  // AI detection using Google Gemini API
  const handleDetection = async () => {
    if (!text.detection.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setIsLoading((prev) => ({ ...prev, detection: true }));
    try {
      // Check if API key is available
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        toast.error('API key is missing. Please add VITE_GEMINI_API_KEY to your .env file');
        return;
      }
      
      // Log that we're using the API key (without revealing it)
      console.log('Using Gemini API key (starts with):', apiKey.substring(0, 5) + '...');
      
      // Add timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const prompt = `You are an AI text detection expert. Your task is to analyze the given text and determine whether it was written by a human or generated by AI.
      
      Follow this process:
      1. Analyze the text for patterns typical of AI generation (repetition, generic phrasing, unnatural transitions)
      2. Look for human-like elements (personal anecdotes, unique perspectives, creative language)
      3. Consider complexity, randomness, and unpredictability of the writing
      
      After analysis, provide a JSON response with these fields:
      - aiProbability: a number between 0 and 100 representing the probability the text was AI-generated
      - humanProbability: a number between 0 and 100 (should be 100 - aiProbability)
      - analysis: a brief explanation (max 150 words) of your reasoning
      
      IMPORTANT: Return valid JSON with no additional text. Do NOT include markdown code blocks, just the raw JSON.
      
      Text to analyze:
      ${text.detection}`;

      console.log('Sending request to Gemini API for AI detection...');
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 800,
          },
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorBody = await response.text().catch(() => null);
        console.error('API response error:', response.status, errorBody);
        throw new Error(`API responded with status ${response.status}: ${errorBody || 'No error body'}`);
      }

      const data = await response.json();
      console.log('Received response from Gemini API:', data);
      
      if (!data || !data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('Invalid API response structure:', data);
        throw new Error('API response format is unexpected');
      }
      
      const responseContent = data.candidates[0].content.parts[0].text;
      console.log('Raw AI detection API response:', responseContent);
      
      // Parse the JSON response
      try {
        // Extract JSON from the response if it's wrapped in markdown code blocks
        let jsonContent = responseContent;
        
        // Try different patterns to extract JSON
        const jsonBlockPattern = /```(?:json)?\s*([\s\S]*?)\s*```/;
        const match = responseContent.match(jsonBlockPattern);
        if (match && match[1]) {
          jsonContent = match[1].trim();
          console.log('Extracted JSON from code block');
        }
        
        // Clean the content further if needed
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        
        // Attempt to parse the JSON
        let parsedResult;
        try {
          parsedResult = JSON.parse(jsonContent);
          console.log('Successfully parsed JSON:', parsedResult);
        } catch (parseError) {
          console.error('JSON parse error for content:', jsonContent);
          console.error('Parse error:', parseError);
          
          // Try to fix common JSON issues and retry parsing
          const fixedJson = jsonContent
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure property names are quoted
            .replace(/'/g, '"'); // Replace single quotes with double quotes
          
          console.log('Attempting to parse fixed JSON:', fixedJson);
          parsedResult = JSON.parse(fixedJson);
        }
        
        // Validate the parsed result has the expected properties
        if (!parsedResult) {
          throw new Error('Failed to parse result into JSON');
        }
        
        // Create a valid result object with defaults for missing fields
        const aiProbability = parsedResult.aiProbability || 50;
        const humanProbability = parsedResult.humanProbability || (100 - aiProbability);
        
        const validatedResult = {
          score: aiProbability,
          aiProbability: aiProbability,
          humanProbability: humanProbability,
          analysis: parsedResult.analysis || 'No detailed analysis provided'
        };
        
        setResults((prev) => ({ ...prev, detection: validatedResult }));
        toast.success('Analysis complete');
      } catch (error) {
        console.error('Failed to parse AI response:', error);
        console.error('Raw content:', responseContent);
        
        // Attempt to create a fallback result if parsing fails
        try {
          // Extract just the analysis using regex if possible
          const analysisMatch = responseContent.match(/analysis["']?\s*:\s*["']([^"']+)["']/i);
          const analysis = analysisMatch ? analysisMatch[1] : 'Unable to extract analysis from response';
          
          // Create a fallback result
          const fallbackResult = {
            score: 50, // Default to 50%
            aiProbability: 50,
            humanProbability: 50,
            analysis: analysis
          };
          
          setResults((prev) => ({ ...prev, detection: fallbackResult }));
          toast.success('Analysis complete (with parsing limitations)');
        } catch (fallbackError) {
          toast.error('Failed to parse analysis result. Please try again');
        }
      }
    } catch (error: any) {
      console.error('Error analyzing text:', error);
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please try again');
      } else if (error.message?.includes('API key')) {
        toast.error('API key issue: Please check your Google Gemini API key');
      } else if (error.message?.includes('status 401') || error.message?.includes('status 403')) {
        toast.error('Authentication failed: Please check your Google Gemini API key');
      } else if (error.message?.includes('status 429')) {
        toast.error('API rate limit exceeded. Please try again later');
      } else if (error.message?.includes('safety settings')) {
        toast.error('Content was flagged by safety filters. Try different text');
      } else {
        toast.error('Failed to analyze text. Please try again with different text');
      }
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

  // Humanize text using Google Gemini API
  const handleHumanize = async () => {
    if (!text.humanize.trim()) {
      toast.error('Please enter some text to humanize');
      return;
    }

    setIsLoading((prev) => ({ ...prev, humanize: true }));
    try {
      // Check if API key is available
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        toast.error('API key is missing. Please add VITE_GEMINI_API_KEY to your .env file');
        return;
      }
      
      // Log that we're using the API key (without revealing it)
      console.log('Using Gemini API key (starts with):', apiKey.substring(0, 5) + '...');
      
      // Add timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const prompt = `${getHumanizeSystemPrompt(humanizeStyle)}
      
      Text to humanize:
      ${text.humanize}
      
      IMPORTANT: Respond with just the humanized text. Do not include explanations, formatting, or additional commentary.`;

      console.log('Sending request to Gemini API for text humanization...');
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
          },
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorBody = await response.text().catch(() => null);
        console.error('API response error:', response.status, errorBody);
        throw new Error(`API responded with status ${response.status}: ${errorBody || 'No error body'}`);
      }

      const data = await response.json();
      console.log('Received response from Gemini API:', data);
      
      if (!data || !data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('Invalid API response structure:', data);
        throw new Error('API response format is unexpected');
      }
      
      // For humanization, we just need the text response, no JSON parsing required
      let humanizedText = data.candidates[0].content.parts[0].text;
      console.log('Humanized text received, length:', humanizedText.length);
      
      // Clean up the response - remove markdown formatting if present
      humanizedText = humanizedText
        .replace(/^```(?:text|markdown)?\s*/g, '')  // Remove opening code blocks
        .replace(/\s*```$/g, '');                  // Remove closing code blocks
      
      // Add fake delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setResults((prev) => ({ 
        ...prev, 
        humanize: {
          humanizedText
        }
      }));
      toast.success('Text humanized successfully!');
    } catch (error: any) {
      console.error('Error humanizing text:', error);
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please try again');
      } else if (error.message?.includes('API key')) {
        toast.error('API key issue: Please check your Google Gemini API key');
      } else if (error.message?.includes('status 401') || error.message?.includes('status 403')) {
        toast.error('Authentication failed: Please check your Google Gemini API key');
      } else if (error.message?.includes('status 429')) {
        toast.error('API rate limit exceeded. Please try again later');
      } else if (error.message?.includes('safety settings')) {
        toast.error('Content was flagged by safety filters. Try different text');
      } else {
        toast.error('Failed to humanize text. Please try again with different text');
      }
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
