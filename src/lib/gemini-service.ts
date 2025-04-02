
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
    temperature: 0.4, // Reduced temperature for more precise outputs
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048, // Increased token limit for more detailed responses
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
      // First try to parse the entire response as JSON
      try {
        return JSON.parse(text);
      } catch (e) {
        // Fall back to regex extraction if direct parsing fails
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Invalid response format");
        }
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      throw new Error("Failed to parse AI response. Please try again with different text.");
    }
  }

  async checkPlagiarism(text: string): Promise<ContentAnalysisResult> {
    try {
      const model = this.getModel();
      const prompt = `
      TASK: Conduct a comprehensive plagiarism analysis on the provided text.
      
      TEXT TO ANALYZE: "${text}"
      
      INSTRUCTIONS:
      1. Thoroughly analyze the text for originality and identify any potential plagiarized content
      2. Consider common academic sources, web content, and published literature
      3. Evaluate linguistic patterns, phrasal uniqueness, and structural originality
      4. Generate a precise plagiarism score on a scale of 0-100 (where 100 is completely original)
      5. Include a minimum of 3 potential sources with accurate similarity percentages if plagiarism is detected
      6. Provide specific actionable recommendations tailored to the content
      
      FORMAT YOUR RESPONSE AS A VALID JSON OBJECT WITH THE FOLLOWING STRUCTURE:
      {
        "score": [number between 0-100 representing originality percentage],
        "details": [comprehensive analysis explaining the originality assessment with specific evidence],
        "suggestions": [array of 4-6 specific, actionable suggestions to improve originality],
        "sources": [
          {
            "text": [precise excerpt of potentially plagiarized text],
            "url": [realistic source URL],
            "similarity": [exact percentage similarity],
            "title": [authentic source title]
          }
        ]
      }
      
      IMPORTANT:
      - Ensure your response contains ONLY the JSON object with no additional text
      - Use realistic, credible sources and accurate similarity percentages
      - Provide detailed analysis that would help academic or professional users
      - Base the score on objective textual analysis, not subjective impression
      - Maintain consistency between the score and the detailed analysis
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
      });

      const response = result.response;
      const textResponse = response.text();
      
      // Extract JSON from the response
      const parsedResponse = this.extractJsonFromResponse(textResponse) as ContentAnalysisResult;
      
      // Validate and normalize the response
      if (typeof parsedResponse.score !== 'number' || parsedResponse.score < 0 || parsedResponse.score > 100) {
        parsedResponse.score = 85; // Default fallback
      }
      
      if (!parsedResponse.details || parsedResponse.details.trim() === '') {
        parsedResponse.details = "The text has been analyzed for potential plagiarism. Please review the results.";
      }
      
      if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions) || parsedResponse.suggestions.length === 0) {
        parsedResponse.suggestions = [
          "Ensure all direct quotes are properly cited",
          "Paraphrase content in your own words",
          "Cite all sources accurately in your reference list",
          "Use plagiarism detection tools before final submission"
        ];
      }
      
      return parsedResponse;
    } catch (error) {
      console.error("Error checking plagiarism:", error);
      throw new Error("Failed to analyze text for plagiarism. Please try again with a different text sample or check your API key.");
    }
  }

  async detectAI(text: string): Promise<AIDetectionResult> {
    try {
      const model = this.getModel();
      const prompt = `
      TASK: Perform a comprehensive analysis to determine whether the provided text was written by an AI or a human.
      
      TEXT TO ANALYZE: "${text}"
      
      INSTRUCTIONS:
      1. Conduct a thorough linguistic analysis examining patterns, consistency, creativity, and irregularities
      2. Identify specific AI writing markers including repetitive structures, unnatural transitions, and formulaic expressions
      3. Evaluate human writing indicators such as personal anecdotes, unique perspectives, and stylistic inconsistencies
      4. Provide detailed text statistics and pattern analysis to support your conclusion
      5. Calculate precise probability scores with statistical justification
      
      FORMAT YOUR RESPONSE AS A VALID JSON OBJECT WITH THE FOLLOWING STRUCTURE:
      {
        "score": [number between 0-100 representing AI probability],
        "aiProbability": [number between 0-100 representing AI probability],
        "humanProbability": [number between 0-100 representing human probability],
        "details": [comprehensive analysis with specific examples from the text],
        "suggestions": [array of 4-6 specific improvements to make AI text more human-like],
        "confidenceLevel": [either "low", "medium", or "high" based on analysis certainty],
        "patterns": {
          "repetitive": [either "Low", "Medium", or "High"],
          "complexity": [either "Low", "Medium", or "High"],
          "variability": [either "Low", "Medium", or "High"]
        },
        "patternAnalysis": [
          {
            "name": [specific pattern name],
            "score": [pattern intensity score between 0-100],
            "description": [detailed explanation of the pattern with examples],
            "severity": [either "low", "medium", or "high"]
          }
        ],
        "textStatistics": {
          "averageSentenceLength": [precise number],
          "vocabularyDiversity": [number between 0-100],
          "repetitivePhrasesCount": [exact number],
          "uncommonWordsPercentage": [number between 0-100]
        },
        "highlightedText": [
          {
            "text": [exact excerpt from the analyzed text],
            "reason": [specific explanation of why this indicates AI writing],
            "type": [one of: "repetition", "pattern", "structure", "vocabulary"]
          }
        ]
      }
      
      IMPORTANT:
      - Ensure your response contains ONLY the JSON object with no additional text
      - Include at least 4 pattern analysis items and 3-5 highlighted text examples
      - Base conclusions on objective textual analysis, not subjective impression
      - Provide detailed, actionable feedback useful to professional writers
      - Calculate all statistics with mathematical precision
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
      });

      const response = result.response;
      const textResponse = response.text();
      
      // Extract JSON from the response
      const parsedResponse = this.extractJsonFromResponse(textResponse) as AIDetectionResult;
      
      // Validate and normalize the response
      if (typeof parsedResponse.score !== 'number' || parsedResponse.score < 0 || parsedResponse.score > 100) {
        parsedResponse.score = 50; // Default fallback
      }
      
      if (!parsedResponse.aiProbability || typeof parsedResponse.aiProbability !== 'number') {
        parsedResponse.aiProbability = parsedResponse.score;
      }
      
      if (!parsedResponse.humanProbability || typeof parsedResponse.humanProbability !== 'number') {
        parsedResponse.humanProbability = 100 - parsedResponse.score;
      }
      
      if (!parsedResponse.confidenceLevel) {
        if (parsedResponse.score > 80 || parsedResponse.score < 20) {
          parsedResponse.confidenceLevel = 'high';
        } else if (parsedResponse.score > 60 || parsedResponse.score < 40) {
          parsedResponse.confidenceLevel = 'medium';
        } else {
          parsedResponse.confidenceLevel = 'low';
        }
      }
      
      if (!parsedResponse.details || parsedResponse.details.trim() === '') {
        parsedResponse.details = "The text has been analyzed for AI detection patterns. Review the results for a detailed assessment.";
      }
      
      return parsedResponse;
    } catch (error) {
      console.error("Error detecting AI:", error);
      throw new Error("Failed to analyze text for AI detection. Please try again with a different text sample or check your API key.");
    }
  }

  async humanizeAI(text: string): Promise<string> {
    try {
      const model = this.getModel();
      const prompt = `
      TASK: Transform the provided AI-generated text into naturally-written human content.
      
      TEXT TO HUMANIZE: "${text}"
      
      INSTRUCTIONS FOR HUMANIZATION:
      1. Restructure the text with varied sentence lengths, natural transitions, and authentic flow
      2. Add personal voice elements such as brief asides, rhetorical questions, and conversational phrases
      3. Introduce subtle imperfections and stylistic variations that characterize human writing
      4. Replace formulaic transitions with organic connections between ideas
      5. Vary vocabulary choices while maintaining the original meaning and expertise level
      6. Include natural hesitations, reconsiderations, or clarifying statements where appropriate
      7. Adjust formality level to sound appropriately casual yet professional
      8. Incorporate authentic analogies or examples that demonstrate personal experience
      9. Ensure the text maintains coherence and readability throughout
      10. Preserve all key points and technical accuracy from the original
      
      IMPORTANT:
      - Return ONLY the humanized text without any explanations or metadata
      - Maintain the same overall length as the original text
      - Preserve the technical accuracy and complexity of the original content
      - Create text that would confidently pass advanced AI detection tools
      - Ensure the tone matches realistic human expert communication
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          ...this.generationConfig,
          temperature: 0.7, // Higher temperature for more creative humanization
        },
        safetySettings: this.safetySettings,
      });

      const response = result.response;
      const humanizedText = response.text();
      
      // Verify the response has content
      if (!humanizedText || humanizedText.trim().length === 0) {
        throw new Error("Empty response received");
      }
      
      return humanizedText;
    } catch (error) {
      console.error("Error humanizing text:", error);
      throw new Error("Failed to humanize the text. Please try again with a different sample or check your API key.");
    }
  }
}

// Export service with the same interface name expected by Dashboard.tsx
export const geminiService = new GeminiService();
