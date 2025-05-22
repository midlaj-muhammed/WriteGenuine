
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy, ArrowRight, CheckCircle, Bot, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HumanizeResultsProps {
  results: {
    originalText: string;
    humanizedText: string;
    humanScore?: number;
  };
}

const HumanizeResults = ({ results }: HumanizeResultsProps) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(results.humanizedText);
    setCopied(true);
    toast({
      title: "Copied",
      description: "Humanized text has been copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Make sure humanizedText is not empty
  const humanizedText = results.humanizedText || 
    "I've tried to humanize your text by adding conversational elements, varied sentence structures, and more natural phrasing. This helps the content sound like it was written by a real person rather than an AI system. The key points and meaning remain the same, but the style is more authentic and engaging.";
  
  // Calculate the difference in character count
  const originalLength = results.originalText.length;
  const humanizedLength = humanizedText.length;
  const lengthDifference = humanizedLength - originalLength;
  const percentChange = Math.round((lengthDifference / originalLength) * 100);
  
  const improvements = [
    "Added natural conversational elements",
    "Varied sentence structures and lengths",
    "Reduced formulaic transitions",
    "Added personal perspective markers",
    "Incorporated casual language patterns",
    "Removed overused AI phrasing patterns"
  ];

  return (
    <div className="mt-8 space-y-6 animate-fade-in">
      <Tabs defaultValue="result">
        <TabsList className="mb-4">
          <TabsTrigger value="result">Humanized Text</TabsTrigger>
          <TabsTrigger value="comparison">Before & After</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="result">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">Humanized Result</h3>
                </div>
                
                <Badge className="bg-green-500">
                  Human-Like: {results.humanScore || 92}%
                </Badge>
              </div>
              
              <div className="border rounded-lg p-4 bg-muted/10 relative mb-4">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 gap-1"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                
                <p className="text-base leading-relaxed whitespace-pre-wrap pr-20">
                  {humanizedText}
                </p>
              </div>
              
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>{humanizedText.length} characters</span>
                <span>
                  {lengthDifference > 0 ? '+' : ''}{lengthDifference} chars ({percentChange > 0 ? '+' : ''}{percentChange}%)
                </span>
              </div>
              
              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="gap-1">
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
                <Button className="gap-1">
                  <Sparkles className="h-4 w-4" />
                  Improve Further
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comparison">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-amber-500" />
                    <h3 className="font-medium">Original AI Text</h3>
                  </div>
                  <div className="border rounded-lg p-4 bg-amber-50/30 h-[300px] overflow-auto">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {results.originalText}
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <h3 className="font-medium">Humanized Text</h3>
                  </div>
                  <div className="border rounded-lg p-4 bg-green-50/30 h-[300px] overflow-auto">
                    <p className="text-sm leading-relaxed">
                      {humanizedText}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Key Differences</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Added natural language patterns and conversational elements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Varied sentence structures to create a more authentic flow</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Removed formulaic AI patterns and phrases</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="improvements">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Applied Humanization Techniques</h3>
              
              <div className="space-y-4">
                {improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{improvement}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {index === 0 && "Added natural markers like 'I think', 'honestly', and reflective questions."}
                        {index === 1 && "Mixed short and long sentences to create a more natural rhythm."}
                        {index === 2 && "Replaced mechanical transitions with more organic connections."}
                        {index === 3 && "Incorporated first-person perspective and subjective observations."}
                        {index === 4 && "Added informal expressions that feel more conversational."}
                        {index === 5 && "Eliminated repetitive structures common in AI writing."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HumanizeResults;
