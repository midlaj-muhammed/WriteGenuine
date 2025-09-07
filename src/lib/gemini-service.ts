// Import the OpenRouter service and re-export its interfaces for compatibility
import openRouterService from "@/lib/openrouter-service";

// Re-export interfaces from openrouter-service for backward compatibility
export type {
  PlagiarismSource,
  AIPatternAnalysis,
  AIDetectionResult,
  ContentAnalysisResult
} from "@/lib/openrouter-service";

// GeminiService class that delegates to OpenRouter service for backward compatibility
class GeminiService {
  async checkPlagiarism(text: string) {
    return openRouterService.checkPlagiarism(text);
  }

  async detectAI(text: string) {
    return openRouterService.detectAI(text);
  }

  async humanizeText(text: string, customPrompt?: string, style?: string) {
    return openRouterService.humanizeText(text, customPrompt, style);
  }

  async humanizeAI(text: string, customPrompt?: string, style?: string) {
    return openRouterService.humanizeText(text, customPrompt, style);
  }
}

export default new GeminiService();
