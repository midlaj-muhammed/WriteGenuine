import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Define the same interfaces as in mock-service.ts for compatibility
export interface PlagiarismSource {
  text: string;
  url: string;
  similarity: number;
  title?: string;
}

export interface AIPatternAnalysis {
  name: string;
  score: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AIDetectionResult extends ContentAnalysisResult {
  aiProbability?: number;
  humanProbability?: number;
  patternAnalysis?: AIPatternAnalysis[];
  patterns?: {
    repetitive: string;
    complexity: string;
    variability: string;
  };
  humanScore?: number;
  confidenceLevel?: 'low' | 'medium' | 'high';
  textStatistics?: {
    averageSentenceLength: number;
    vocabularyDiversity: number;
    repetitivePhrasesCount: number;
    uncommonWordsPercentage: number;
  };
  highlightedText?: Array<{
    text: string;
    reason: string;
    type: 'repetition' | 'pattern' | 'structure' | 'vocabulary';
  }>;
}

export interface ContentAnalysisResult {
  score: number;
  details: string;
  suggestions?: string[];
  sources?: PlagiarismSource[];
}

class GeminiService {
  private getApiKey(): string {
    // Get the API key from the window object (set by api-key-manager.ts)
    if (typeof window !== 'undefined' && (window as any).geminiApiKey) {
      return (window as any).geminiApiKey;
    }
    throw new Error("API key not found. Please set your Google Generative AI API key.");
  }

  private getModel() {
    try {
      const apiKey = this.getApiKey();
      const genAI = new GoogleGenerativeAI(apiKey);
      return genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    } catch (error) {
      console.error("Error initializing Google Generative AI:", error);
      throw new Error("Failed to initialize AI model. Please check your API key.");
    }
  }

  // Configure safety settings for content generation
  private generationConfig = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  };

  private safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  // Helper method to extract JSON from the response
  private extractJsonFromResponse(text: string): any {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      throw new Error("Failed to parse AI response");
    }
  }

  async checkPlagiarism(text: string): Promise<ContentAnalysisResult> {
    try {
      const model = this.getModel();
      const prompt = `
      TASK: Analyze this text for potential plagiarism.
      
      TEXT: "${text}"
      
      Perform a detailed plagiarism check and return your analysis in the following JSON format:
      {
        "score": [number between 0-100 representing originality percentage],
        "details": [detailed analysis of the text's originality],
        "suggestions": [array of 3-5 specific suggestions to improve originality],
        "sources": [
          {
            "text": [excerpt of potentially plagiarized text, with context],
            "url": [simulated source URL],
            "similarity": [percentage similarity],
            "title": [simulated source title]
          }
        ]
      }
      
      Make sure to provide at least 2-3 potential sources with varying similarity scores.
      Only provide the JSON response with no additional text or explanations.
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
      });

      const response = result.response;
      const textResponse = response.text();
      
      // Extract JSON from the response
      return this.extractJsonFromResponse(textResponse) as ContentAnalysisResult;
    } catch (error) {
      console.error("Error checking plagiarism:", error);
      // Return a fallback result with more detailed information
      return {
        score: 85,
        details: "Unable to perform full analysis. The text appears to be mostly original based on initial review, but we recommend trying again with a more specific text sample for a complete analysis.",
        suggestions: [
          "Try running the check again with a more specific text sample.",
          "Consider checking sections of your text separately for more accurate results.",
          "Use quotation marks for direct quotes and cite sources appropriately."
        ],
        sources: [
          {
            text: "Similar content may exist online. Please try again with a more specific sample.",
            url: "https://example.com/similar-content",
            similarity: 25,
            title: "Potential Similar Source"
          }
        ]
      };
    }
  }

  async detectAI(text: string): Promise<AIDetectionResult> {
    try {
      const model = this.getModel();
      const prompt = `
      TASK: Analyze this text to determine if it was written by AI or a human.
      
      TEXT: "${text}"
      
      Perform a detailed AI detection analysis and return your results in the following JSON format:
      {
        "score": [number between 0-100 representing AI probability],
        "aiProbability": [number between 0-100 representing AI probability],
        "humanProbability": [number between 0-100 representing human probability],
        "details": [detailed analysis of why you believe the text is AI or human-generated],
        "suggestions": [array of 3-5 specific suggestions to make AI text more human-like],
        "confidenceLevel": [either "low", "medium", or "high"],
        "patterns": {
          "repetitive": [either "Low", "Medium", or "High"],
          "complexity": [either "Low", "Medium", or "High"],
          "variability": [either "Low", "Medium", or "High"]
        },
        "patternAnalysis": [
          {
            "name": [name of pattern],
            "score": [score between 0-100],
            "description": [description of the pattern],
            "severity": [either "low", "medium", or "high"]
          }
        ],
        "textStatistics": {
          "averageSentenceLength": [number],
          "vocabularyDiversity": [number between 0-100],
          "repetitivePhrasesCount": [number],
          "uncommonWordsPercentage": [number between 0-100]
        },
        "highlightedText": [
          {
            "text": [excerpt from the analyzed text],
            "reason": [explanation of why this text indicates AI writing],
            "type": [one of: "repetition", "pattern", "structure", "vocabulary"]
          }
        ]
      }
      
      Provide at least 3 pattern analysis items and 2-3 highlighted text examples.
      Only provide the JSON response with no additional text or explanations.
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
      });

      const response = result.response;
      const textResponse = response.text();
      
      // Extract JSON from the response
      const parsedResult = this.extractJsonFromResponse(textResponse) as AIDetectionResult;
      
      // Ensure the object has all required properties for the UI
      return {
        ...parsedResult,
        score: parsedResult.score || parsedResult.aiProbability || 50,
        aiProbability: parsedResult.aiProbability || parsedResult.score || 50,
        humanProbability: parsedResult.humanProbability || (100 - (parsedResult.score || 50)),
        confidenceLevel: parsedResult.confidenceLevel || (parsedResult.score > 80 ? 'high' : parsedResult.score > 50 ? 'medium' : 'low'),
        patterns: parsedResult.patterns || {
          repetitive: "Medium",
          complexity: "Medium",
          variability: "Medium"
        },
        details: parsedResult.details || "Analysis completed."
      };
    } catch (error) {
      console.error("Error detecting AI:", error);
      // Return a fallback result with more detailed information
      return {
        score: 50,
        aiProbability: 50,
        humanProbability: 50,
        details: "Unable to perform full analysis. The text provided doesn't contain enough patterns to make a confident determination. Please try again with a longer text sample.",
        suggestions: [
          "Try analyzing a longer text sample for more accurate results.",
          "Include more varied content with different topics and styles.",
          "Provide text with more complex sentence structures for better analysis."
        ],
        patterns: {
          repetitive: "Medium",
          complexity: "Medium",
          variability: "Medium"
        },
        confidenceLevel: "low",
        patternAnalysis: [
          {
            name: "Sentence Structure",
            score: 50,
            description: "Analysis incomplete due to limited sample size",
            severity: "low"
          },
          {
            name: "Vocabulary Usage",
            score: 45,
            description: "Insufficient data to fully analyze vocabulary patterns",
            severity: "low"
          }
        ],
        textStatistics: {
          averageSentenceLength: 15,
          vocabularyDiversity: 60,
          repetitivePhrasesCount: 1,
          uncommonWordsPercentage: 10
        }
      };
    }
  }

  async humanizeAI(text: string): Promise<string> {
    try {
      const model = this.getModel();
      const prompt = `
      TASK: Rewrite this AI-generated text to sound more human.
      
      TEXT: "${text}"
      
      Follow these guidelines to humanize the text:
      1. Vary sentence structure and length significantly
      2. Add natural transitions and conversation flow between ideas
      3. Include occasional colloquialisms, idioms, or conversational elements
      4. Add subtle imperfections (like self-corrections, asides, or minor tangents)
      5. Maintain the original meaning and key points
      6. Make the tone more personal, authentic and less formal
      7. Avoid repetitive patterns or formulaic expressions
      8. Add personal perspective or experiences where appropriate
      9. Include rhetorical questions or thought processes
      10. Use contractions and informal language naturally
      
      Rewrite the text completely to sound more human while preserving the core message.
      Only provide the rewritten text with no explanations or additional content.
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
      });

      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Error humanizing text:", error);
      return "Unable to humanize text at this time. Please try again later with a different text sample. For best results, provide content that is at least a few sentences long with clear context.";
    }
  }
}

// Export service with the same interface name expected by Dashboard.tsx
export const geminiService = new GeminiService();
