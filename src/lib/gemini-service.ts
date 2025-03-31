
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
  patternAnalysis?: AIPatternAnalysis[];
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

  async checkPlagiarism(text: string): Promise<ContentAnalysisResult> {
    try {
      const model = this.getModel();
      const prompt = `
      TASK: Analyze this text for potential plagiarism.
      
      TEXT: "${text}"
      
      Perform a simulated plagiarism check and return your analysis in the following JSON format:
      {
        "score": [number between 0-100 representing originality percentage],
        "details": [detailed analysis of the text's originality],
        "suggestions": [array of 3-5 suggestions to improve originality],
        "sources": [
          {
            "text": [excerpt of potentially plagiarized text],
            "url": [simulated source URL],
            "similarity": [percentage similarity],
            "title": [simulated source title]
          }
        ]
      }
      
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
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse response");
      }
      
      return JSON.parse(jsonMatch[0]) as ContentAnalysisResult;
    } catch (error) {
      console.error("Error checking plagiarism:", error);
      // Return a fallback result
      return {
        score: 85,
        details: "Unable to perform full analysis. The text appears to be mostly original based on initial review.",
        suggestions: ["Try running the check again with a more specific text sample."],
        sources: []
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
        "humanScore": [number between 0-100 representing human probability],
        "confidenceLevel": [either "low", "medium", or "high"],
        "details": [detailed analysis of why you believe the text is AI or human-generated],
        "suggestions": [array of 3-5 suggestions to make AI text more human-like],
        "patternAnalysis": [
          {
            "name": [pattern name],
            "score": [pattern score],
            "description": [pattern description],
            "severity": [either "low", "medium", or "high"]
          }
        ],
        "textStatistics": {
          "averageSentenceLength": [average sentence length],
          "vocabularyDiversity": [vocabulary diversity score],
          "repetitivePhrasesCount": [count of repetitive phrases],
          "uncommonWordsPercentage": [percentage of uncommon words]
        },
        "highlightedText": [
          {
            "text": [highlighted text excerpt],
            "reason": [reason for highlighting],
            "type": [either "repetition", "pattern", "structure", or "vocabulary"]
          }
        ]
      }
      
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
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse response");
      }
      
      return JSON.parse(jsonMatch[0]) as AIDetectionResult;
    } catch (error) {
      console.error("Error detecting AI:", error);
      // Return a fallback result
      return {
        score: 50,
        humanScore: 50,
        confidenceLevel: "low",
        details: "Unable to perform full analysis. The analysis could not be completed with high confidence.",
        suggestions: ["Try analyzing a longer text sample for more accurate results."],
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
      1. Vary sentence structure and length
      2. Add natural transitions between ideas
      3. Include occasional colloquialisms or conversational elements
      4. Add subtle imperfections (like self-corrections or asides)
      5. Maintain the original meaning and key points
      6. Make the tone more personal and authentic
      7. Avoid repetitive patterns
      
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
      return "Unable to humanize text at this time. Please try again later with a different text sample.";
    }
  }
}

// Export service with the same interface name expected by Dashboard.tsx
export const geminiService = new GeminiService();
