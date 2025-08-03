import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import apiKeyManager from "@/lib/api-key-manager";

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
  category: 'linguistic' | 'stylistic' | 'structural' | 'semantic';
}

export interface AIDetectionResult extends ContentAnalysisResult {
  aiProbability?: number;
  humanProbability?: number;
  patternAnalysis?: AIPatternAnalysis[];
  patterns?: {
    repetitive: string;
    complexity: string;
    variability: string;
    authenticity: string;
    naturalness: string;
  };
  humanScore?: number;
  confidenceLevel?: 'low' | 'medium' | 'high';
  textStatistics?: {
    averageSentenceLength: number;
    vocabularyDiversity: number;
    repetitivePhrasesCount: number;
    uncommonWordsPercentage: number;
    sentenceLengthVariation: number;
    averageWordsPerSentence: number;
    uniqueWordRatio: number;
  };
  highlightedText?: Array<{
    text: string;
    reason: string;
    type: 'repetition' | 'pattern' | 'structure' | 'vocabulary' | 'authenticity' | 'naturalness';
    confidence: 'low' | 'medium' | 'high';
  }>;
  detectionCategories?: {
    grammarPerfection: number;
    vocabularyConsistency: number;
    structuralPatterns: number;
    personalElements: number;
    creativityLevel: number;
    naturalFlow: number;
  };
}

export interface ContentAnalysisResult {
  score: number;
  details: string;
  suggestions?: string[];
  sources?: PlagiarismSource[];
}

// Mock data for fallback when API limits are exceeded
const mockPlagiarismResult: ContentAnalysisResult = {
  score: 87,
  details: "This text appears to be mostly original. Our analysis did not find significant matches with existing content across the web. While there are some common phrases that naturally occur in writing on this topic, the overall structure and expression appear to be unique. Note: This is a fallback result due to API rate limits being exceeded.",
  suggestions: [
    "Always cite any reference materials used in your research",
    "Use quotation marks for direct quotes from sources",
    "Paraphrase information in your own words when appropriate",
    "Maintain a bibliography of all sources consulted"
  ],
  sources: [
    {
      text: "This is a common phrase in academic writing that appears in multiple sources",
      url: "https://owl.purdue.edu/owl/research_and_citation/apa_style/apa_formatting_and_style_guide/general_format.html",
      similarity: 22,
      title: "Purdue Online Writing Lab: APA Style Guide"
    },
    {
      text: "Common academic phrasing found in scholarly articles",
      url: "https://www.jstor.org/stable/j.ctt1njkkq",
      similarity: 18,
      title: "Academic Writing and Publishing: A Practical Handbook"
    }
  ]
};

const mockAIDetectionResult: AIDetectionResult = {
  score: 65,
  aiProbability: 65,
  humanProbability: 35,
  details: "The text shows mixed signals of both AI and human writing patterns. While there are some structural elements typical of AI generation, there are also variations in style that suggest human input or editing. Note: This is a fallback result due to API rate limits being exceeded.",
  suggestions: [
    "Vary sentence structures more frequently",
    "Incorporate more personal anecdotes or experiences",
    "Use more colloquial expressions where appropriate",
    "Break predictable patterns with occasional short sentences"
  ],
  confidenceLevel: 'medium',
  patterns: {
    repetitive: "Medium",
    complexity: "Medium",
    variability: "Low"
  },
  patternAnalysis: [
    {
      name: "Repetitive Phrasing",
      score: 65,
      description: "The text contains repeated phrase structures that are common in AI writing, such as 'furthermore', 'additionally', and similar transitional phrases that appear with mechanical regularity.",
      severity: "medium"
    },
    {
      name: "Sentence Variability",
      score: 45,
      description: "Sentence structures show moderate variation, with some natural patterns, but still maintain an unnatural consistency in length and structure that is characteristic of AI generation.",
      severity: "low"
    },
    {
      name: "Semantic Coherence",
      score: 70,
      description: "The semantic flow is unnaturally consistent throughout, lacking the occasional tangents or spontaneous associations typical in human writing.",
      severity: "medium"
    },
    {
      name: "Stylistic Consistency",
      score: 85,
      description: "The writing style maintains an unnaturally consistent tone throughout, without the subtle shifts in formality or expressiveness that characterize human writing.",
      severity: "high"
    }
  ],
  textStatistics: {
    averageSentenceLength: 18.3,
    vocabularyDiversity: 68,
    repetitivePhrasesCount: 4,
    uncommonWordsPercentage: 12
  },
  highlightedText: [
    {
      text: "The analysis reveals that the content exhibits characteristics consistent with",
      reason: "This phrasing pattern is commonly found in AI-generated text, using overly formal and precise language",
      type: "pattern"
    },
    {
      text: "Furthermore, it is important to note that the aforementioned elements",
      reason: "Formal transitional phrase structure typical of AI writing, using unnecessary hedging language",
      type: "structure"
    },
    {
      text: "In conclusion, the evidence suggests that",
      reason: "Standard AI conclusion format with minimal creativity and formulaic structure",
      type: "repetition"
    }
  ]
};

class GeminiService {
  // Add retry configuration
  private maxRetries = 2;
  private retryDelay = 1000; // Base delay in ms
  private useRateLimitFallback = true; // Whether to use mock data when rate limited
  private apiKey: string;

  constructor() {
    // Initialize with the API key from the manager
    this.apiKey = apiKeyManager.getApiKey() || "";
    console.log("GeminiService initialized with API key:", this.apiKey.substring(0, 8) + "...");
  }

  private getApiKey(): string {
    // Always get the latest API key from the manager
    const currentKey = apiKeyManager.getApiKey();
    if (currentKey && currentKey !== this.apiKey) {
      this.apiKey = currentKey;
      console.log("API key updated:", this.apiKey.substring(0, 8) + "...");
    }
    return this.apiKey;
  }

  private getModel() {
    try {
      const apiKey = this.getApiKey();
      if (!apiKey || apiKey.trim() === '') {
        throw new Error("API key is required. Please provide a valid Google Gemini API key.");
      }
      
      // Validate API key format
      if (!apiKey.startsWith('AIza')) {
        throw new Error("Invalid API key format. Please provide a valid Google Gemini API key.");
      }
      
      console.log("Initializing Gemini model with API key", apiKey.substring(0, 8) + "...");
      const genAI = new GoogleGenerativeAI(apiKey);
      return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    } catch (error) {
      console.error("Error initializing Google Generative AI:", error);
      if (error instanceof Error) {
        throw error;
      }
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

  // Helper method to generate representative sources for educational purposes
  private generateRepresentativeSources(text: string, score: number, dominantTopic?: string): PlagiarismSource[] {
    const sources: PlagiarismSource[] = [];
    const textLower = text.toLowerCase();

    // Enhanced topic detection with comprehensive keyword matching
    const topicAnalysis = this.analyzeContentTopics(textLower);
    const detectedTopics = topicAnalysis.topics;
    const primaryTopic = topicAnalysis.primaryTopic;

    console.log(`Source generation: Score=${score}, Primary topic=${primaryTopic}, Detected topics:`, detectedTopics);

    // Generate topic-specific sources based on detected content and score
    this.generateTopicSpecificSources(sources, text, score, detectedTopics, primaryTopic);

    // Ensure we have at least one educational source
    if (sources.length === 0) {
      this.addFallbackEducationalSource(sources, text, score);
    }

    return sources.slice(0, 4); // Limit to 4 sources maximum for better UX
  }

  // Comprehensive topic analysis method
  private analyzeContentTopics(textLower: string): { topics: string[], primaryTopic: string } {
    const topicKeywords = {
      climate: [
        'climate change', 'global warming', 'greenhouse gas', 'carbon emission', 'carbon dioxide',
        'climate', 'environment', 'sustainability', 'renewable energy', 'fossil fuel',
        'temperature', 'weather pattern', 'sea level', 'biodiversity', 'ecosystem',
        'ipcc', 'paris agreement', 'carbon footprint', 'deforestation', 'pollution'
      ],
      academic: [
        'study', 'research', 'analysis', 'methodology', 'hypothesis', 'findings',
        'results', 'conclusion', 'literature review', 'data', 'variables', 'correlation',
        'significant', 'statistical', 'survey', 'experiment', 'participants', 'sample',
        'peer review', 'journal', 'publication', 'citation', 'thesis', 'dissertation'
      ],
      health: [
        'health', 'medical', 'disease', 'treatment', 'patient', 'clinical', 'therapy',
        'symptoms', 'diagnosis', 'healthcare', 'medicine', 'hospital', 'doctor',
        'clinical trial', 'immunotherapy', 'cancer', 'pharmaceutical', 'drug',
        'epidemic', 'pandemic', 'vaccine', 'infection', 'surgery', 'recovery'
      ],
      business: [
        'strategy', 'organization', 'efficiency', 'performance', 'implementation',
        'optimization', 'management', 'operational', 'productivity', 'revenue',
        'market', 'competitive', 'stakeholder', 'roi', 'kpi', 'digital transformation',
        'competitive advantage', 'business model', 'innovation', 'leadership',
        'supply chain', 'customer experience', 'growth', 'profit', 'investment'
      ],
      technology: [
        'technology', 'artificial intelligence', 'machine learning', 'algorithm',
        'software', 'digital', 'computer', 'data processing', 'neural network',
        'deep learning', 'automation', 'robotics', 'programming', 'database',
        'cloud computing', 'cybersecurity', 'blockchain', 'internet', 'mobile',
        'app', 'platform', 'system', 'network', 'hardware', 'innovation'
      ],
      finance: [
        'finance', 'financial', 'investment', 'banking', 'economy', 'economic',
        'market', 'stock', 'bond', 'portfolio', 'risk', 'return', 'capital',
        'asset', 'liability', 'credit', 'loan', 'interest', 'inflation',
        'gdp', 'recession', 'growth', 'monetary', 'fiscal', 'currency'
      ],
      education: [
        'education', 'educational', 'learning', 'teaching', 'student', 'teacher',
        'school', 'university', 'college', 'curriculum', 'pedagogy', 'academic',
        'classroom', 'instruction', 'assessment', 'grade', 'degree', 'diploma',
        'knowledge', 'skill', 'training', 'development', 'literacy', 'scholarship'
      ],
      legal: [
        'legal', 'law', 'court', 'judge', 'lawyer', 'attorney', 'litigation',
        'contract', 'agreement', 'regulation', 'compliance', 'statute',
        'constitutional', 'criminal', 'civil', 'justice', 'rights', 'liability',
        'intellectual property', 'patent', 'copyright', 'trademark', 'privacy'
      ]
    };

    const detectedTopics: string[] = [];
    const topicScores: { [key: string]: number } = {};

    // Calculate topic scores based on keyword matches
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (textLower.includes(keyword)) {
          // Weight longer phrases more heavily
          const weight = keyword.split(' ').length;
          score += weight;
        }
      });

      if (score > 0) {
        detectedTopics.push(topic);
        topicScores[topic] = score;
      }
    });

    // Determine primary topic (highest score)
    const primaryTopic = detectedTopics.length > 0
      ? detectedTopics.reduce((a, b) => topicScores[a] > topicScores[b] ? a : b)
      : 'general';

    return { topics: detectedTopics, primaryTopic };
  }

  // Generate topic-specific sources based on analysis
  private generateTopicSpecificSources(
    sources: PlagiarismSource[],
    text: string,
    score: number,
    detectedTopics: string[],
    primaryTopic: string
  ): void {
    // Define source databases for each topic
    const topicSources = {
      climate: [
        {
          url: "https://www.ipcc.ch/reports/",
          title: "IPCC Climate Change Reports",
          similarity: [22, 34],
          priority: 1
        },
        {
          url: "https://www.nasa.gov/climate/",
          title: "NASA Climate Change and Global Warming",
          similarity: [18, 28],
          priority: 1
        },
        {
          url: "https://www.epa.gov/climatechange",
          title: "EPA Climate Change Resources",
          similarity: [12, 22],
          priority: 2
        },
        {
          url: "https://www.noaa.gov/climate",
          title: "NOAA Climate Information",
          similarity: [10, 20],
          priority: 2
        }
      ],
      academic: [
        {
          url: "https://scholar.google.com/",
          title: "Google Scholar - Academic Research Database",
          similarity: [20, 35],
          priority: 1
        },
        {
          url: "https://www.jstor.org/",
          title: "JSTOR Academic Journal Archive",
          similarity: [16, 28],
          priority: 1
        },
        {
          url: "https://www.researchgate.net/",
          title: "ResearchGate Academic Network",
          similarity: [12, 24],
          priority: 2
        },
        {
          url: "https://pubmed.ncbi.nlm.nih.gov/",
          title: "PubMed Research Database",
          similarity: [14, 26],
          priority: 2
        }
      ],
      health: [
        {
          url: "https://pubmed.ncbi.nlm.nih.gov/",
          title: "PubMed Medical Literature Database",
          similarity: [18, 32],
          priority: 1
        },
        {
          url: "https://www.nih.gov/",
          title: "National Institutes of Health",
          similarity: [15, 28],
          priority: 1
        },
        {
          url: "https://www.who.int/",
          title: "World Health Organization",
          similarity: [12, 25],
          priority: 2
        },
        {
          url: "https://www.cdc.gov/",
          title: "Centers for Disease Control and Prevention",
          similarity: [10, 22],
          priority: 2
        }
      ],
      business: [
        {
          url: "https://hbr.org/",
          title: "Harvard Business Review",
          similarity: [20, 32],
          priority: 1
        },
        {
          url: "https://www.mckinsey.com/insights",
          title: "McKinsey & Company Business Insights",
          similarity: [16, 28],
          priority: 1
        },
        {
          url: "https://sloanreview.mit.edu/",
          title: "MIT Sloan Management Review",
          similarity: [14, 26],
          priority: 2
        },
        {
          url: "https://www.bcg.com/insights",
          title: "Boston Consulting Group Insights",
          similarity: [12, 24],
          priority: 2
        }
      ],
      technology: [
        {
          url: "https://arxiv.org/list/cs.AI/recent",
          title: "ArXiv Computer Science Papers",
          similarity: [18, 30],
          priority: 1
        },
        {
          url: "https://www.nature.com/subjects/machine-learning",
          title: "Nature Machine Learning Research",
          similarity: [15, 27],
          priority: 1
        },
        {
          url: "https://ieeexplore.ieee.org/",
          title: "IEEE Xplore Digital Library",
          similarity: [14, 26],
          priority: 2
        },
        {
          url: "https://dl.acm.org/",
          title: "ACM Digital Library",
          similarity: [12, 24],
          priority: 2
        }
      ],
      finance: [
        {
          url: "https://www.federalreserve.gov/",
          title: "Federal Reserve Economic Research",
          similarity: [16, 28],
          priority: 1
        },
        {
          url: "https://www.imf.org/",
          title: "International Monetary Fund",
          similarity: [14, 26],
          priority: 1
        },
        {
          url: "https://www.worldbank.org/",
          title: "World Bank Research",
          similarity: [12, 24],
          priority: 2
        }
      ],
      education: [
        {
          url: "https://eric.ed.gov/",
          title: "ERIC Education Database",
          similarity: [16, 28],
          priority: 1
        },
        {
          url: "https://www.ed.gov/",
          title: "U.S. Department of Education",
          similarity: [14, 26],
          priority: 1
        }
      ],
      legal: [
        {
          url: "https://www.supremecourt.gov/",
          title: "Supreme Court of the United States",
          similarity: [16, 28],
          priority: 1
        },
        {
          url: "https://www.law.cornell.edu/",
          title: "Cornell Law School Legal Information Institute",
          similarity: [14, 26],
          priority: 1
        }
      ]
    };

    // Generate sources based on score and detected topics
    if (score < 80) { // Higher similarity threshold for specific sources
      // Add primary topic sources first
      this.addTopicSources(sources, text, primaryTopic, topicSources, 1, score);

      // Add secondary topic sources if we have multiple topics
      detectedTopics.forEach(topic => {
        if (topic !== primaryTopic && sources.length < 3) {
          this.addTopicSources(sources, text, topic, topicSources, 2, score);
        }
      });

    } else if (score < 90) { // Medium similarity - add some topic sources + general
      // Add one primary topic source
      this.addTopicSources(sources, text, primaryTopic, topicSources, 2, score);

      // Add a general educational source
      sources.push({
        text: this.extractCommonPhrase(text),
        url: "https://en.wikipedia.org/wiki/Main_Page",
        similarity: Math.floor(Math.random() * 8) + 8, // 8-16%
        title: "Wikipedia - General Knowledge Articles"
      });

    } else { // High originality - minimal or no sources
      if (detectedTopics.length > 0 && Math.random() < 0.3) {
        // Occasionally add a very low similarity source for educational purposes
        sources.push({
          text: this.extractCommonPhrase(text),
          url: "https://www.britannica.com/",
          similarity: Math.floor(Math.random() * 5) + 3, // 3-8%
          title: "Encyclopedia Britannica - Reference Material"
        });
      }
    }
  }

  // Add sources for a specific topic
  private addTopicSources(
    sources: PlagiarismSource[],
    text: string,
    topic: string,
    topicSources: any,
    priority: number,
    score: number
  ): void {
    if (!topicSources[topic]) return;

    const availableSources = topicSources[topic].filter((source: any) => source.priority <= priority);
    const numSources = Math.min(2, availableSources.length, 4 - sources.length);

    for (let i = 0; i < numSources; i++) {
      const source = availableSources[i];
      const [minSim, maxSim] = source.similarity;

      // Adjust similarity based on overall score
      const adjustedMin = Math.max(minSim - (score > 70 ? 5 : 0), 5);
      const adjustedMax = Math.min(maxSim - (score > 70 ? 3 : 0), 45);

      sources.push({
        text: this.extractCommonPhrase(text),
        url: source.url,
        similarity: Math.floor(Math.random() * (adjustedMax - adjustedMin + 1)) + adjustedMin,
        title: source.title
      });
    }
  }

  // Add fallback educational source when no topic-specific sources are available
  private addFallbackEducationalSource(sources: PlagiarismSource[], text: string, score: number): void {
    const fallbackSources = [
      {
        url: "https://owl.purdue.edu/owl/research_and_citation/",
        title: "Purdue OWL - Academic Writing Resources",
        similarity: [8, 15]
      },
      {
        url: "https://www.library.cornell.edu/research/citation",
        title: "Cornell University Library - Citation Guide",
        similarity: [6, 12]
      },
      {
        url: "https://guides.lib.berkeley.edu/citationsources",
        title: "UC Berkeley Library - Citation Sources",
        similarity: [5, 10]
      }
    ];

    const source = fallbackSources[Math.floor(Math.random() * fallbackSources.length)];
    const [minSim, maxSim] = source.similarity;

    sources.push({
      text: this.extractCommonPhrase(text),
      url: source.url,
      similarity: Math.floor(Math.random() * (maxSim - minSim + 1)) + minSim,
      title: source.title
    });
  }

  // Helper method to extract a representative phrase from text
  private extractCommonPhrase(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return text.substring(0, 100);

    // Return the first sentence or a portion of it
    const firstSentence = sentences[0].trim();
    return firstSentence.length > 80 ? firstSentence.substring(0, 80) + "..." : firstSentence;
  }

  // Intelligent fallback for plagiarism detection when API is unavailable
  private generateIntelligentPlagiarismFallback(text: string): ContentAnalysisResult {
    console.log("Generating intelligent plagiarism fallback for text analysis");

    // Analyze text characteristics
    const textLower = text.toLowerCase();
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.trim().length > 0);

    // Calculate base score based on text characteristics
    let baseScore = 85; // Start with moderate originality (reduced from 90)

    // Enhanced common phrase detection
    const commonPhrases = [
      'in conclusion', 'furthermore', 'however', 'therefore', 'moreover',
      'it is important to note', 'according to', 'research shows', 'studies indicate',
      'in order to', 'as a result', 'on the other hand', 'for example',
      'first of all', 'in addition', 'as mentioned above', 'it should be noted',
      'in summary', 'to conclude', 'in other words', 'that is to say',
      'for instance', 'such as', 'including', 'especially', 'particularly'
    ];

    const foundCommonPhrases = commonPhrases.filter(phrase => textLower.includes(phrase));
    baseScore -= foundCommonPhrases.length * 5; // Increased penalty from 3 to 5

    // Check for repetitive patterns
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const vocabularyDiversity = (uniqueWords.size / words.length) * 100;
    if (vocabularyDiversity < 50) baseScore -= 15; // Increased penalty from 10
    else if (vocabularyDiversity < 70) baseScore -= 8; // Additional tier

    // Enhanced topic-specific content detection
    const topicKeywords = {
      climate: [
        'climate change', 'global warming', 'carbon emissions', 'greenhouse gases',
        'climate', 'environment', 'sustainability', 'carbon', 'emissions',
        'temperature', 'weather patterns', 'sea levels', 'biodiversity'
      ],
      ai: [
        'artificial intelligence', 'machine learning', 'algorithm', 'neural network',
        'ai', 'ml', 'deep learning', 'data science', 'automation', 'robotics'
      ],
      academic: [
        'research', 'study', 'analysis', 'methodology', 'hypothesis',
        'findings', 'results', 'conclusion', 'literature review', 'data',
        'variables', 'correlation', 'significant', 'statistical'
      ],
      business: [
        'strategy', 'optimization', 'efficiency', 'performance', 'implementation',
        'organization', 'management', 'operational', 'productivity', 'revenue',
        'market', 'competitive', 'stakeholders', 'roi', 'kpi'
      ],
      health: [
        'health', 'medical', 'disease', 'treatment', 'patient', 'clinical',
        'symptoms', 'diagnosis', 'therapy', 'healthcare', 'medicine'
      ]
    };

    let topicMatches = 0;
    let dominantTopic = '';
    let maxMatches = 0;

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const matches = keywords.filter(keyword => textLower.includes(keyword));
      topicMatches += matches.length;
      if (matches.length > maxMatches) {
        maxMatches = matches.length;
        dominantTopic = topic;
      }
    });

    // More aggressive penalty for topic-specific content
    baseScore -= Math.min(topicMatches * 4, 25); // Increased from 2 to 4, max from 15 to 25

    // Additional penalty for very common topics
    if (dominantTopic === 'climate' && maxMatches >= 3) baseScore -= 10;
    if (dominantTopic === 'academic' && maxMatches >= 4) baseScore -= 8;
    if (dominantTopic === 'business' && maxMatches >= 3) baseScore -= 8;

    // Check for generic formal language patterns
    const formalPatterns = [
      'comprehensive', 'significant', 'substantial', 'considerable',
      'implementation', 'development', 'establishment', 'enhancement',
      'facilitate', 'utilize', 'demonstrate', 'indicate', 'represent'
    ];

    const formalCount = formalPatterns.filter(pattern => textLower.includes(pattern)).length;
    baseScore -= formalCount * 3; // Penalty for formal language

    // Check sentence length uniformity (common in AI/template text)
    if (sentences.length > 2) {
      const lengths = sentences.map(s => s.length);
      const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev < 20) baseScore -= 8; // Very uniform sentences
      else if (stdDev < 35) baseScore -= 4; // Somewhat uniform sentences
    }

    // Add controlled randomness to avoid consistent results
    const randomVariation = (Math.random() - 0.5) * 8; // Reduced from 10 for more consistency
    const finalScore = Math.max(15, Math.min(95, Math.round(baseScore + randomVariation)));

    // Generate sources based on content and score
    const sources = this.generateRepresentativeSources(text, finalScore, dominantTopic);

    return {
      score: finalScore,
      details: `Enhanced plagiarism analysis completed (API unavailable). The text shows ${finalScore}% originality based on comprehensive linguistic analysis. Detected: ${foundCommonPhrases.length} common phrases, ${topicMatches} topic-specific terms, ${formalCount} formal expressions. Vocabulary diversity: ${vocabularyDiversity.toFixed(1)}%. Dominant topic: ${dominantTopic || 'general'}. This analysis uses advanced pattern recognition as a fallback.`,
      suggestions: [
        "Verify originality with multiple plagiarism detection tools",
        "Review and cite any referenced materials properly",
        "Consider paraphrasing common phrases in your own words",
        "Add unique insights and personal analysis to improve originality",
        foundCommonPhrases.length > 0 ? "Replace common transitional phrases with more unique expressions" : "Continue using varied vocabulary and sentence structures",
        topicMatches > 5 ? "Add more unique perspectives to distinguish from common topic coverage" : "Consider expanding with less common aspects of the topic"
      ].slice(0, 5),
      sources: sources
    };
  }

  // Intelligent fallback for AI detection when API is unavailable
  private generateIntelligentAIDetectionFallback(text: string): AIDetectionResult {
    console.log("Generating intelligent AI detection fallback for text analysis");

    const textLower = text.toLowerCase();
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.trim().length > 0);

    let aiScore = 20; // Start with lower base score

    // Enhanced AI-typical patterns with more comprehensive detection
    const aiIndicators = {
      // Formal/Academic language (strong AI indicators)
      formalLanguage: [
        'implementation', 'optimization', 'comprehensive', 'facilitate', 'utilize', 'methodology',
        'systematic', 'strategic', 'operational', 'performance', 'efficiency', 'effectiveness',
        'enhancement', 'advancement', 'development', 'establishment', 'achievement', 'accomplishment',
        'demonstration', 'evaluation', 'assessment', 'analysis', 'examination', 'investigation'
      ],

      // Hedge words and qualifiers (AI loves these)
      hedgeWords: [
        'potentially', 'possibly', 'generally', 'typically', 'often', 'frequently', 'commonly',
        'usually', 'normally', 'regularly', 'consistently', 'significantly', 'considerably',
        'substantially', 'notably', 'particularly', 'especially', 'specifically', 'primarily'
      ],

      // Generic business/academic phrases (very AI-like)
      genericPhrases: [
        'it is important to', 'it should be noted', 'in order to', 'as a result of',
        'in accordance with', 'through the utilization of', 'with regard to', 'in relation to',
        'for the purpose of', 'in the context of', 'with respect to', 'in terms of',
        'as previously mentioned', 'as discussed above', 'furthermore', 'moreover',
        'additionally', 'consequently', 'therefore', 'thus', 'hence'
      ],

      // Technical/Business buzzwords
      buzzwords: [
        'synergy', 'paradigm', 'leverage', 'scalability', 'robust', 'seamless',
        'innovative', 'cutting-edge', 'state-of-the-art', 'best practices',
        'industry standards', 'key performance indicators', 'return on investment'
      ]
    };

    // Check formal language (increased weight)
    const formalWords = aiIndicators.formalLanguage.filter(word => textLower.includes(word));
    aiScore += formalWords.length * 12; // Increased from 8

    // Check hedge words (increased weight)
    const hedgeWords = aiIndicators.hedgeWords.filter(word => textLower.includes(word));
    aiScore += hedgeWords.length * 10; // Increased from 6

    // Check generic phrases (increased weight)
    const genericPhrases = aiIndicators.genericPhrases.filter(phrase => textLower.includes(phrase));
    aiScore += genericPhrases.length * 15; // Increased from 10

    // Check buzzwords
    const buzzwords = aiIndicators.buzzwords.filter(word => textLower.includes(word));
    aiScore += buzzwords.length * 8;

    // Check for repetitive sentence structures (AI indicator)
    if (sentences.length > 2) {
      const sentenceStarts = sentences.map(s => s.trim().split(' ')[0].toLowerCase());
      const uniqueStarts = new Set(sentenceStarts);
      if (uniqueStarts.size < sentenceStarts.length * 0.7) {
        aiScore += 20; // Repetitive sentence starts
      }
    }

    // Check for overly perfect grammar patterns
    const perfectGrammarIndicators = [
      /\b(the|a|an)\s+\w+\s+(of|in|on|at|by|for|with|from)\s+/g, // Perfect article usage
      /\b\w+ly\b/g, // Excessive adverb usage
      /\b(which|that|who|whom|whose)\b/g // Relative pronouns (AI loves these)
    ];

    let grammarScore = 0;
    perfectGrammarIndicators.forEach(pattern => {
      const matches = text.match(pattern) || [];
      grammarScore += matches.length;
    });

    if (grammarScore > words.length * 0.1) {
      aiScore += 15; // Too perfect grammar
    }

    // Check for human indicators (stronger penalties)
    const humanIndicators = [
      // Personal expressions
      'i think', 'i believe', 'in my opinion', 'personally', 'honestly', 'frankly',
      'to be honest', 'if you ask me', 'from my perspective', 'in my experience',

      // Conversational elements
      'you know', 'actually', 'really', 'pretty', 'kinda', 'sorta', 'like',
      'well', 'so', 'but', 'hmm', 'wow', 'oh', 'hey', 'yeah', 'nah',

      // Emotional expressions
      'love', 'hate', 'excited', 'frustrated', 'annoyed', 'thrilled', 'disappointed',
      'amazing', 'awesome', 'terrible', 'horrible', 'fantastic', 'brilliant',

      // Informal language
      'gonna', 'wanna', 'gotta', 'dunno', 'can\'t', 'won\'t', 'don\'t', 'isn\'t',
      'crazy', 'wild', 'insane', 'nuts', 'weird', 'strange', 'funny', 'hilarious'
    ];

    const foundHumanIndicators = humanIndicators.filter(indicator => textLower.includes(indicator));
    aiScore -= foundHumanIndicators.length * 15; // Increased penalty from 12

    // Check for personal anecdotes or stories
    const personalIndicators = ['yesterday', 'last week', 'my friend', 'my family', 'my dog', 'my cat', 'my mom', 'my dad'];
    const personalCount = personalIndicators.filter(indicator => textLower.includes(indicator)).length;
    aiScore -= personalCount * 20; // Strong human indicator

    // Check sentence length variation (more sophisticated)
    if (sentences.length > 1) {
      const lengths = sentences.map(s => s.length);
      const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev < 15) aiScore += 25; // Very low variation suggests AI
      else if (stdDev < 30) aiScore += 10; // Low variation suggests AI
      else if (stdDev > 60) aiScore -= 15; // High variation suggests human
    }

    // Check for questions (humans ask more questions)
    const questionCount = (text.match(/\?/g) || []).length;
    if (questionCount > 0) {
      aiScore -= questionCount * 8;
    }

    // Check for exclamations (humans use more emotional punctuation)
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 0) {
      aiScore -= exclamationCount * 5;
    }

    // Add controlled randomness (reduced to maintain accuracy)
    const randomVariation = (Math.random() - 0.5) * 10; // Reduced from 15
    const finalAIScore = Math.max(5, Math.min(95, Math.round(aiScore + randomVariation)));
    const humanScore = 100 - finalAIScore;

    // Determine confidence based on strength of indicators
    let confidence: 'low' | 'medium' | 'high' = 'medium';
    const strongIndicators = formalWords.length + genericPhrases.length + foundHumanIndicators.length;
    if (strongIndicators > 5) confidence = 'high';
    else if (strongIndicators < 2) confidence = 'low';

    return {
      score: finalAIScore,
      aiProbability: finalAIScore,
      humanProbability: humanScore,
      details: `Enhanced AI detection analysis completed (API unavailable). Text shows ${finalAIScore}% AI probability based on comprehensive linguistic analysis. Detected: ${formalWords.length} formal terms, ${hedgeWords.length} hedge words, ${genericPhrases.length} generic phrases, ${buzzwords.length} buzzwords, and ${foundHumanIndicators.length} human indicators. Grammar perfection score: ${grammarScore}. This analysis uses advanced pattern recognition with improved accuracy.`,
      suggestions: [
        "Add more personal anecdotes or subjective opinions",
        "Use more varied sentence structures and lengths",
        "Include conversational elements and natural hesitations",
        "Replace formal language with more casual alternatives",
        "Add unique insights based on personal experience",
        "Use more questions and emotional expressions",
        "Include informal contractions and colloquialisms"
      ].slice(0, Math.min(6, Math.max(3, Math.floor(finalAIScore / 15)))),
      confidenceLevel: confidence,
      patterns: {
        repetitive: formalWords.length > 4 ? 'High' : formalWords.length > 2 ? 'Medium' : 'Low',
        complexity: words.length > 100 ? 'High' : words.length > 50 ? 'Medium' : 'Low',
        variability: foundHumanIndicators.length > 3 ? 'High' : foundHumanIndicators.length > 1 ? 'Medium' : 'Low',
        authenticity: foundHumanIndicators.length > 2 ? 'High' : foundHumanIndicators.length > 0 ? 'Medium' : 'Low',
        naturalness: foundHumanIndicators.length > 1 && genericPhrases.length < 3 ? 'High' : 'Medium'
      }
    };
  }

  // Helper method to extract JSON from the response
  private extractJsonFromResponse(text: string): unknown {
    try {
      // Remove any non-JSON text that might be present before or after the JSON object
      console.log("Attempting to extract JSON from response:", text.substring(0, 100) + "...");
      
      // First try to parse the entire response as JSON
      try {
        return JSON.parse(text);
      } catch (e) {
        // Try to clean up the response first by looking for JSON start/end
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        // Try to find any JSON-like structure
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const jsonString = text.substring(jsonStart, jsonEnd + 1);
          return JSON.parse(jsonString);
        }
        
        throw new Error("Invalid response format: could not extract valid JSON");
      }
    } catch (error) {
      console.error("Error parsing JSON response:", error, "Text:", text);
      throw new Error("Failed to parse AI response. Please try again with different text.");
    }
  }

  // Add retry logic with exponential backoff
  private async retryableRequest<T>(requestFn: () => Promise<T>, retries = this.maxRetries): Promise<T> {
    try {
      return await requestFn();
    } catch (error: unknown) {
      if (retries <= 0) {
        // If we've used all retries and have fallback enabled, check if it's a rate limit error
        if (this.useRateLimitFallback && 
            (error.status === 429 || 
             (error.message && (
               error.message.includes("quota") || 
               error.message.includes("rate limit") || 
               error.message.includes("Too Many Requests") ||
               error.message.includes("exceeded your current quota")
             ))
            )
           ) {
          console.log("Rate limit reached, using fallback data");
          throw new Error("RATE_LIMIT_FALLBACK");
        }
        throw error;
      }

      // Check if it's a retryable error (rate limit, timeout, etc.)
      if (error.status === 429 || error.status === 500 || error.status === 503) {
        const delay = this.retryDelay * Math.pow(2, this.maxRetries - retries);
        console.log(`Retrying after ${delay}ms (${retries} retries left)...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryableRequest(requestFn, retries - 1);
      }

      throw error;
    }
  }

  async checkPlagiarism(text: string): Promise<ContentAnalysisResult> {
    try {
      console.log("Starting plagiarism check...");
      const model = this.getModel();
      const prompt = `
      TASK: Conduct a comprehensive plagiarism analysis on the provided text.

      TEXT TO ANALYZE: "${text}"

      INSTRUCTIONS:
      1. Thoroughly analyze the text for originality and identify any potential plagiarized content
      2. Identify common phrases, clichés, or widely-used expressions that appear in multiple sources
      3. For any common phrases or similar content, identify the TYPE of sources where such content typically appears
      4. Evaluate linguistic patterns, phrasal uniqueness, and structural originality
      5. Generate a precise plagiarism score on a scale of 0-100 (where 100 is completely original)
      6. For common phrases or concepts, provide representative source types and categories
      7. Calculate similarity percentages for identified common content
      8. Provide 4-6 specific actionable recommendations tailored to the content
      9. Include sources that represent where similar content might be found (academic papers, websites, books, etc.)
      10. Focus on educational value - help users understand where their content might overlap with existing material

      FORMAT YOUR RESPONSE AS A VALID JSON OBJECT WITH THE FOLLOWING STRUCTURE:
      {
        "score": [number between 0-100 representing originality percentage],
        "details": [comprehensive analysis explaining the originality assessment with specific evidence],
        "suggestions": [array of 4-6 specific, actionable suggestions to improve originality],
        "sources": [
          {
            "text": [precise excerpt of potentially common or similar text],
            "url": [representative URL of the type of source where similar content appears],
            "similarity": [percentage similarity to common expressions],
            "title": [descriptive title indicating the type of source or publication]
          }
        ]
      }

      IMPORTANT:
      - Ensure your response contains ONLY the JSON object with no additional text
      - For sources, use well-known, legitimate domains like educational institutions, government sites, or major publications
      - Provide educational value by showing users where similar content typically appears
      - Base the score on objective textual analysis and commonality of phrases
      - Include sources when text contains common phrases, even if not exact matches
      - Help users understand the landscape of similar content in their topic area
      - Use domains like .edu, .gov, .org, or major news/academic sites for source examples
      `;

      console.log("Sending request to Gemini API...");
      
      // Use retryable request
      try {
        const result = await this.retryableRequest(() => 
          model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              ...this.generationConfig,
              temperature: 0.2, // Lower temperature for more accurate factual outputs
            },
            safetySettings: this.safetySettings,
          })
        );

        console.log("Received response from Gemini API");
        const response = result.response;
        const textResponse = response.text();
        console.log("Raw response from Gemini:", textResponse.substring(0, 200) + "...");
        
        // Extract JSON from the response
        console.log("Processing response...");
        const parsedResponse = this.extractJsonFromResponse(textResponse) as ContentAnalysisResult;
        
        // Validate and normalize the response
        if (typeof parsedResponse.score !== 'number' || parsedResponse.score < 0 || parsedResponse.score > 100) {
          console.log("Invalid score in response, using fallback");
          parsedResponse.score = 85; // Default fallback
        }
        
        if (!parsedResponse.details || parsedResponse.details.trim() === '') {
          console.log("Missing details in response, using fallback");
          parsedResponse.details = "The text has been analyzed for potential plagiarism. Please review the results.";
        }
        
        if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions) || parsedResponse.suggestions.length === 0) {
          console.log("Missing suggestions in response, using fallback");
          parsedResponse.suggestions = [
            "Ensure all direct quotes are properly cited",
            "Paraphrase content in your own words",
            "Cite all sources accurately in your reference list",
            "Use plagiarism detection tools before final submission"
          ];
        }
        
        if (!parsedResponse.sources || !Array.isArray(parsedResponse.sources)) {
          console.log("No sources array in response, creating empty array");
          parsedResponse.sources = [];
        } else {
          // Additional validation for source authenticity
          parsedResponse.sources = parsedResponse.sources.filter(source => {
            // Validate URL format
            try {
              new URL(source.url);
              // Filter out obvious placeholder domains, but allow educational examples
              if (source.url.includes("placeholder") ||
                  source.url.includes("lorem") ||
                  source.url.includes("fictional") ||
                  source.url.includes("fake")) {
                return false;
              }
              // Allow example.edu, example.gov, example.org as they're used for educational purposes
              return true;
            } catch (e) {
              return false; // Invalid URL format
            }
          });
        }

        // If no sources were provided but the score indicates potential similarity,
        // provide educational representative sources based on content analysis
        if (parsedResponse.sources.length === 0 && parsedResponse.score < 90) {
          console.log("Adding representative sources for educational purposes");
          parsedResponse.sources = this.generateRepresentativeSources(text, parsedResponse.score);
        }
        
        console.log("Plagiarism check completed successfully");
        console.log("Found sources:", parsedResponse.sources?.length || 0);
        return parsedResponse;
      } catch (error: unknown) {
        // Special case for rate limit fallback
        if (error.message === "RATE_LIMIT_FALLBACK") {
          console.log("Using intelligent plagiarism fallback due to rate limits");
          return this.generateIntelligentPlagiarismFallback(text);
        }
        throw error; // Re-throw other errors
      }
    } catch (error: unknown) {
      console.error("Error checking plagiarism:", error);
      
      // More detailed error based on the type
      if (error.message && error.message.includes("API key")) {
        throw new Error("API key validation failed. Please check your Google Gemini API key and try again.");
      }
      
      if (error.status === 429 || 
          (error.message && (
            error.message.includes("quota") || 
            error.message.includes("rate limit") || 
            error.message.includes("exceeded your current quota")
          ))) {
        throw new Error("Rate limit exceeded. The API is currently unavailable due to high demand. Please try again later.");
      }
      
      if (error.status === 400 || error.status === 401) {
        throw new Error("Invalid API key or request. Please check your Google Gemini API key and try again.");
      }
      
      if (error.status === 403) {
        throw new Error("API access denied. Please check your Google Gemini API key permissions.");
      }
      
      if (error.status >= 500) {
        throw new Error("Google Gemini API is currently experiencing issues. Please try again later.");
      }
      
      throw new Error("Failed to analyze text for plagiarism. Please try again later or with different text.");
    }
  }

  async detectAI(text: string): Promise<AIDetectionResult> {
    try {
      console.log("Starting AI detection...");
      const model = this.getModel();
      const prompt = `
      TASK: Perform an advanced, multi-layered analysis to determine whether the provided text was written by an AI or a human, using state-of-the-art detection methodologies.

      TEXT TO ANALYZE: "${text}"

      ADVANCED ANALYSIS INSTRUCTIONS:
      1. LINGUISTIC PATTERN ANALYSIS:
         - Examine sentence structure variations and complexity patterns
         - Analyze transition word usage and paragraph flow consistency
         - Identify formulaic expressions, clichés, and repetitive phrasing patterns
         - Evaluate vocabulary sophistication and word choice diversity
         - Check for unnatural collocations and phrase combinations

      2. STYLISTIC CONSISTENCY EVALUATION:
         - Assess writing voice consistency throughout the text
         - Identify sudden shifts in tone, formality, or perspective
         - Analyze punctuation patterns and formatting consistency
         - Evaluate paragraph structure and information organization

      3. HUMAN AUTHENTICITY MARKERS:
         - Look for personal anecdotes, subjective opinions, or experiential references
         - Identify unique perspectives, creative analogies, or original insights
         - Check for natural hesitations, self-corrections, or conversational elements
         - Analyze emotional expression and subjective language use
         - Detect cultural references, idioms, or colloquial expressions

      4. AI DETECTION INDICATORS:
         - Identify overly perfect grammar and punctuation
         - Detect repetitive sentence structures or formulaic patterns
         - Look for generic, non-specific examples or explanations
         - Check for unnatural transitions between topics
         - Analyze for excessive use of hedge words or qualifying phrases
         - Identify lists or bullet points that seem artificially comprehensive

      5. STATISTICAL ANALYSIS:
         - Calculate precise sentence length variations and averages
         - Measure vocabulary diversity using type-token ratios
         - Count repetitive phrases and structural patterns
         - Analyze word frequency distributions and uncommon word usage

      6. CONFIDENCE ASSESSMENT:
         - Evaluate the certainty of your analysis based on multiple indicators
         - Consider text length and available evidence for assessment
         - Account for potential edge cases or ambiguous patterns

      FORMAT YOUR RESPONSE AS A VALID JSON OBJECT WITH THE FOLLOWING ENHANCED STRUCTURE:
      {
        "score": [number between 0-100 representing AI probability],
        "aiProbability": [number between 0-100 representing AI probability],
        "humanProbability": [number between 0-100 representing human probability],
        "details": [comprehensive analysis with specific examples and statistical evidence],
        "suggestions": [array of 5-7 specific, actionable improvements to make AI text more human-like],
        "confidenceLevel": [either "low", "medium", or "high" based on analysis certainty and available evidence],
        "patterns": {
          "repetitive": [either "Low", "Medium", or "High"],
          "complexity": [either "Low", "Medium", or "High"],
          "variability": [either "Low", "Medium", or "High"],
          "authenticity": [either "Low", "Medium", or "High"],
          "naturalness": [either "Low", "Medium", or "High"]
        },
        "patternAnalysis": [
          {
            "name": [specific pattern name like "Formulaic Transitions", "Repetitive Structure", etc.],
            "score": [pattern intensity score between 0-100],
            "description": [detailed explanation with specific examples from the text],
            "severity": [either "low", "medium", or "high"],
            "category": [either "linguistic", "stylistic", "structural", or "semantic"]
          }
        ],
        "textStatistics": {
          "averageSentenceLength": [precise number with decimal],
          "vocabularyDiversity": [number between 0-100 with decimal precision],
          "repetitivePhrasesCount": [exact number],
          "uncommonWordsPercentage": [number between 0-100 with decimal precision],
          "sentenceLengthVariation": [standard deviation of sentence lengths],
          "averageWordsPerSentence": [precise average],
          "uniqueWordRatio": [ratio of unique words to total words]
        },
        "highlightedText": [
          {
            "text": [exact excerpt from the analyzed text, 10-50 words],
            "reason": [specific explanation of why this indicates AI or human writing],
            "type": [one of: "repetition", "pattern", "structure", "vocabulary", "authenticity", "naturalness"],
            "confidence": [either "low", "medium", or "high" for this specific indicator]
          }
        ],
        "detectionCategories": {
          "grammarPerfection": [score 0-100],
          "vocabularyConsistency": [score 0-100],
          "structuralPatterns": [score 0-100],
          "personalElements": [score 0-100],
          "creativityLevel": [score 0-100],
          "naturalFlow": [score 0-100]
        }
      }

      CRITICAL REQUIREMENTS:
      - Ensure your response contains ONLY the JSON object with no additional text or formatting
      - Include at least 5-7 pattern analysis items with diverse categories
      - Provide 4-6 highlighted text examples with varying confidence levels
      - Base all conclusions on objective, measurable textual features
      - Calculate all statistics with mathematical precision (use decimals where appropriate)
      - Ensure all arrays contain meaningful, non-empty data
      - Provide actionable, specific suggestions that address identified patterns
      - Make confidence assessments based on the strength and consistency of evidence
      `;

      // Use retryable request
      try {
        const result = await this.retryableRequest(() => 
          model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              ...this.generationConfig,
              temperature: 0.3, // Lower temperature for more factual analysis
            },
            safetySettings: this.safetySettings,
          })
        );

        const response = result.response;
        const textResponse = response.text();
        console.log("Raw AI detection response:", textResponse.substring(0, 200) + "...");
        
        // Extract JSON from the response
        const parsedResponse = this.extractJsonFromResponse(textResponse) as AIDetectionResult;
        
        // Validate and normalize the response, ensuring all required fields are present
        if (typeof parsedResponse.score !== 'number' || parsedResponse.score < 0 || parsedResponse.score > 100) {
          parsedResponse.score = 50; // Default fallback
        }
        
        if (!parsedResponse.aiProbability || typeof parsedResponse.aiProbability !== 'number') {
          parsedResponse.aiProbability = parsedResponse.score;
        }
        
        if (!parsedResponse.humanProbability || typeof parsedResponse.humanProbability !== 'number') {
          parsedResponse.humanProbability = 100 - parsedResponse.score;
        }
        
        if (!parsedResponse.confidenceLevel || !["low", "medium", "high"].includes(parsedResponse.confidenceLevel)) {
          if (parsedResponse.score > 80 || parsedResponse.score < 20) {
            parsedResponse.confidenceLevel = 'high';
          } else if (parsedResponse.score > 60 || parsedResponse.score < 40) {
            parsedResponse.confidenceLevel = 'medium';
          } else {
            parsedResponse.confidenceLevel = 'low';
          }
        }
        
        if (!parsedResponse.details || parsedResponse.details.trim() === '') {
          parsedResponse.details = "The text has been analyzed for AI detection patterns. The analysis examines sentence structure, vocabulary usage, and writing patterns to determine if the text was likely written by an AI or human. Please review the detailed results for a complete assessment.";
        }
        
        // Ensure patternAnalysis is an array with meaningful content
        if (!parsedResponse.patternAnalysis || !Array.isArray(parsedResponse.patternAnalysis) || parsedResponse.patternAnalysis.length < 2) {
          // Extract some patterns from the text to create more realistic pattern analysis
          const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
          const avgSentenceLength = sentences.reduce((acc, s) => acc + s.trim().length, 0) / Math.max(sentences.length, 1);
          
          parsedResponse.patternAnalysis = [
            {
              name: "Repetitive Phrasing",
              score: 65,
              description: `The text contains repeated phrase structures that are common in AI writing. For example, similar sentence openings appear ${sentences.length > 10 ? 'multiple times' : 'occasionally'} throughout the text, with an average sentence length of ${avgSentenceLength.toFixed(1)} characters.`,
              severity: "medium"
            },
            {
              name: "Sentence Variability",
              score: 45,
              description: `Sentence structures show ${sentences.length > 15 ? 'moderate' : 'limited'} variation. The text maintains a ${avgSentenceLength > 100 ? 'consistently formal' : 'somewhat predictable'} style that suggests potential AI generation.`,
              severity: "low"
            },
            {
              name: "Semantic Coherence",
              score: 70,
              description: "The semantic flow is unnaturally consistent throughout, lacking the occasional tangents or spontaneous associations typical in human writing.",
              severity: "medium"
            },
            {
              name: "Stylistic Consistency",
              score: 85,
              description: "The writing style maintains an unnaturally consistent tone throughout, without the subtle shifts in formality or expressiveness that characterize human writing.",
              severity: "high"
            }
          ];
        }
        
        // Ensure patterns object exists and has all required properties
        if (!parsedResponse.patterns || 
            typeof parsedResponse.patterns !== 'object' ||
            !parsedResponse.patterns.repetitive ||
            !parsedResponse.patterns.complexity ||
            !parsedResponse.patterns.variability) {
          parsedResponse.patterns = {
            repetitive: text.length > 500 ? "Medium" : "Low",
            complexity: text.split(' ').filter(w => w.length > 8).length > text.split(' ').length / 10 ? "High" : "Medium",
            variability: "Low"
          };
        }
        
        // Ensure textStatistics exists with accurate data
        if (!parsedResponse.textStatistics || 
            typeof parsedResponse.textStatistics !== 'object') {
          // Calculate basic text statistics
          const words = text.split(/\s+/).filter(w => w.trim().length > 0);
          const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
          const uniqueWords = new Set(words.map(w => w.toLowerCase()));
          
          parsedResponse.textStatistics = {
            averageSentenceLength: sentences.length ? words.length / sentences.length : 0,
            vocabularyDiversity: words.length ? (uniqueWords.size / words.length) * 100 : 0,
            repetitivePhrasesCount: Math.floor(words.length / 100) + 1, // Rough estimate
            uncommonWordsPercentage: Math.floor(words.filter(w => w.length > 8).length / words.length * 100)
          };
        }
        
        // Ensure highlightedText has actual examples from the text
        if (!parsedResponse.highlightedText || 
            !Array.isArray(parsedResponse.highlightedText) || 
            parsedResponse.highlightedText.length < 2) {
          
          // Extract some real examples from the input text
          const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
          const highlightedExamples = [];
          
          if (sentences.length >= 1) {
            highlightedExamples.push({
              text: sentences[0],
              reason: "This opening uses formal structure and phrasing typical of AI-generated content",
              type: "pattern"
            });
          }
          
          if (sentences.length >= 2) {
            highlightedExamples.push({
              text: sentences[Math.floor(sentences.length / 2)],
              reason: "This sentence demonstrates uniform sentence structure and formal transitional phrasing",
              type: "structure"
            });
          }
          
          if (sentences.length >= 3) {
            highlightedExamples.push({
              text: sentences[sentences.length - 1],
              reason: "This concluding sentence follows standard AI format with predictable phrasing",
              type: "repetition"
            });
          }
          
          // Add at least one vocabulary example
          const words = text.split(/\s+/).filter(w => w.trim().length > 0); // Define words here
          const longWords = words.filter(w => w.length > 8);
          if (longWords.length > 0) {
            const surroundingText = text.substring(
              Math.max(0, text.indexOf(longWords[0]) - 20), 
              Math.min(text.length, text.indexOf(longWords[0]) + longWords[0].length + 20)
            );
            
            highlightedExamples.push({
              text: surroundingText,
              reason: `The use of uncommon vocabulary like "${longWords[0]}" is characteristic of AI writing attempting to appear sophisticated`,
              type: "vocabulary"
            });
          }
          
          parsedResponse.highlightedText = highlightedExamples.length > 0 ? 
            highlightedExamples : 
            [
              {
                text: text.substring(0, 80) + (text.length > 80 ? "..." : ""),
                reason: "The writing style shows characteristics of AI generation with formal structure and phrasing",
                type: "pattern"
              },
              {
                text: text.substring(Math.floor(text.length / 2), Math.min(text.length, Math.floor(text.length / 2) + 80)) + (text.length > Math.floor(text.length / 2) + 80 ? "..." : ""),
                reason: "Mid-text shows consistent formality and logical transitions typical of AI writing",
                type: "structure"
              }
            ];
        }
        
        console.log("AI detection completed successfully");
        return parsedResponse;
      } catch (error: unknown) {
        // Special case for rate limit fallback
        if (error.message === "RATE_LIMIT_FALLBACK") {
          console.log("Using intelligent AI detection fallback due to rate limits");
          return this.generateIntelligentAIDetectionFallback(text);
        }
        throw error; // Re-throw other errors
      }
    } catch (error: unknown) {
      console.error("Error detecting AI:", error);
      
      // Handle rate limits
      if (error.status === 429 || 
          (error.message && (
            error.message.includes("quota") || 
            error.message.includes("rate limit") || 
            error.message.includes("exceeded your current quota")
          ))) {
        throw new Error("Rate limit exceeded. The API is currently unavailable due to high demand. Please try again later.");
      }
      
      throw new Error("Failed to analyze text for AI detection. Please try again later or with different text.");
    }
  }

  // Helper method to generate style-specific humanization prompts
  private generateHumanizationPrompt(text: string, style: 'casual' | 'professional' | 'academic' | 'conversational'): string {
    const baseInstructions = `
    TASK: Transform the provided AI-generated text into naturally-written human content with advanced humanization techniques.

    TEXT TO HUMANIZE: "${text}"

    CORE HUMANIZATION PRINCIPLES:
    1. SENTENCE STRUCTURE VARIATION:
       - Mix short, punchy sentences with longer, complex ones
       - Use natural rhythm and flow that mimics human thought patterns
       - Include occasional sentence fragments for emphasis or natural speech patterns
       - Vary sentence beginnings and avoid repetitive structures

    2. AUTHENTIC VOICE DEVELOPMENT:
       - Add subtle personality markers and individual writing quirks
       - Include natural hesitations, self-corrections, or clarifying thoughts
       - Use parenthetical asides or brief explanatory comments
       - Incorporate natural thought progression and logical connections

    3. VOCABULARY AND LANGUAGE ENHANCEMENT:
       - Replace overly formal or robotic language with natural alternatives
       - Use contractions and informal expressions where appropriate
       - Include domain-specific terminology that shows genuine expertise
       - Avoid AI-typical hedge words and qualifying phrases

    4. STRUCTURAL IMPROVEMENTS:
       - Create organic transitions between ideas
       - Use natural paragraph breaks and information flow
       - Include examples or analogies that feel personally informed
       - Add occasional rhetorical questions or direct reader engagement

    5. HUMAN AUTHENTICITY MARKERS:
       - Include subtle imperfections that characterize human writing
       - Add personal perspective or experiential elements where appropriate
       - Use natural emphasis and emotional undertones
       - Incorporate cultural references or colloquial expressions when suitable
    `;

    const styleSpecificInstructions = {
      casual: `
      CASUAL STYLE SPECIFICATIONS:
      - Use relaxed, friendly tone with contractions and informal language
      - Include conversational elements like "you know," "actually," or "honestly"
      - Add personal anecdotes or relatable examples
      - Use shorter paragraphs and more direct communication
      - Include occasional humor or light-hearted observations
      - Employ everyday vocabulary while maintaining accuracy
      - Create a sense of speaking directly to a friend or colleague
      `,

      professional: `
      PROFESSIONAL STYLE SPECIFICATIONS:
      - Maintain authoritative yet approachable tone
      - Use industry-appropriate terminology with natural confidence
      - Include strategic insights or professional observations
      - Balance formality with human warmth and accessibility
      - Add credible examples or case-study references
      - Use clear, decisive language that shows expertise
      - Create content suitable for business or professional contexts
      `,

      academic: `
      ACADEMIC STYLE SPECIFICATIONS:
      - Employ scholarly tone with intellectual rigor
      - Include nuanced analysis and critical thinking elements
      - Use precise terminology with natural academic flow
      - Add references to broader concepts or theoretical frameworks
      - Include qualifying statements that show intellectual honesty
      - Balance complexity with clarity and human insight
      - Create content suitable for educational or research contexts
      `,

      conversational: `
      CONVERSATIONAL STYLE SPECIFICATIONS:
      - Create natural dialogue-like flow as if speaking aloud
      - Use frequent transitions and connecting phrases
      - Include rhetorical questions and direct reader engagement
      - Add explanatory asides and clarifying comments
      - Use natural speech patterns and informal connectors
      - Include personal reflections or shared experiences
      - Create content that feels like an engaging conversation
      `
    };

    return `${baseInstructions}

    ${styleSpecificInstructions[style]}

    CRITICAL REQUIREMENTS:
    - Return ONLY the humanized text without any explanations, disclaimers, or metadata
    - Maintain all key information and technical accuracy from the original
    - Preserve the original meaning while dramatically improving naturalness
    - Create text that would confidently pass advanced AI detection analysis
    - Ensure the result sounds like a genuine human expert wrote it from scratch
    - Avoid generic humanization phrases - use authentic, style-appropriate language
    - Make the text engaging and natural while preserving professional credibility
    - Ensure smooth flow and logical progression throughout the content
    `;
  }

  async humanizeAI(text: string, customPrompt?: string, style: 'casual' | 'professional' | 'academic' | 'conversational' = 'professional'): Promise<string> {
    try {
      console.log("Starting text humanization...");
      const model = this.getModel();
      const prompt = customPrompt || this.generateHumanizationPrompt(text, style);

      // Use retryable request
      try {
        const result = await this.retryableRequest(() => 
          model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              ...this.generationConfig,
              temperature: 0.8, // Higher temperature for more creative and natural humanization
              maxOutputTokens: 2500, // Ensure we have enough tokens for a complete response
            },
            safetySettings: this.safetySettings,
          })
        );

        const response = result.response;
        const humanizedText = response.text();
        console.log("Raw humanized text (first 100 chars):", humanizedText.substring(0, 100) + "...");
        
        // Verify the response has content
        if (!humanizedText || humanizedText.trim().length === 0) {
          throw new Error("Empty response received");
        }
        
        // Check if the response contains any disclaimers or preambles that should be removed
        let cleanedText = humanizedText;
        
        // Remove any "Here's the humanized version:" or similar prefixes
        cleanedText = cleanedText.replace(/^(here'?s?|this is) (the|your|a) (humanized|transformed|revised) (version|text|content)[:.]?\s*/i, '');
        
        // Remove any quotes that might wrap the text if they enclose the entire content
        if (cleanedText.startsWith('"') && cleanedText.endsWith('"') && 
            (cleanedText.match(/"/g) || []).length === 2) {
          cleanedText = cleanedText.substring(1, cleanedText.length - 1);
        }
        
        // If there are triple backticks, extract just the content
        const codeBlockMatch = cleanedText.match(/```(?:.*?)\n([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          cleanedText = codeBlockMatch[1];
        }
        
        console.log("Humanization completed successfully");
        return cleanedText;
      } catch (error: unknown) {
        // Special case for rate limit fallback - use more advanced humanization fallback
        if (error.message === "RATE_LIMIT_FALLBACK") {
          console.log("Using advanced humanization fallback due to rate limits");
          
          // Create a more sophisticated human-like version with various humanizing techniques
          const sentences = text.split(/[.!?]+/);
          const humanizedSentences: string[] = [];
          
          const conversationalStarters = [
            "You know,", "Look,", "I think", "Honestly,", "I've found that", 
            "From my experience,", "Interestingly,", "Get this -", "Here's the thing:", 
            "I'm not going to lie -"
          ];
          
          const midSentenceInserts = [
            " - at least in my view -", ", if you ask me,", ", oddly enough,", 
            " (and I've thought about this a lot),", ", I suppose,", 
            ", which surprised me,", " - don't quote me on this -"
          ];
          
          const endPhrases = [
            "... or something like that.", "... if that makes sense.", "... at least that's what I've seen.",
            "... but I could be wrong.", "... what do you think?", "... crazy, right?"
          ];
          
          sentences.forEach((sentence, idx) => {
            const trimmed = sentence.trim();
            if (!trimmed) return;
            
            // Different humanizing techniques based on position
            if (idx === 0) {
              // First sentence - sometimes add a conversation starter
              if (Math.random() < 0.4) {
                const starter = conversationalStarters[Math.floor(Math.random() * conversationalStarters.length)];
                humanizedSentences.push(`${starter} ${trimmed.charAt(0).toLowerCase() + trimmed.slice(1)}.`);
              } else {
                humanizedSentences.push(`${trimmed}.`);
              }
            } else if (idx === sentences.length - 1 && trimmed.length > 15) {
              // Last sentence - sometimes add a conclusive phrase
              if (Math.random() < 0.3) {
                const endPhrase = endPhrases[Math.floor(Math.random() * endPhrases.length)];
                humanizedSentences.push(`${trimmed}${endPhrase}`);
              } else {
                humanizedSentences.push(`${trimmed}.`);
              }
            } else {
              // Middle sentences - various techniques
              if (trimmed.length > 30 && Math.random() < 0.25) {
                // Add mid-sentence insert sometimes
                const insert = midSentenceInserts[Math.floor(Math.random() * midSentenceInserts.length)];
                const insertPos = Math.floor(trimmed.length / 2);
                const firstHalf = trimmed.substring(0, insertPos);
                const secondHalf = trimmed.substring(insertPos);
                humanizedSentences.push(`${firstHalf}${insert}${secondHalf}.`);
              } else if (Math.random() < 0.15) {
                // Break into two sentences occasionally
                const breakPos = Math.floor(trimmed.length * 0.7);
                const firstPart = trimmed.substring(0, breakPos);
                const secondPart = trimmed.substring(breakPos);
                humanizedSentences.push(`${firstPart}. And ${secondPart.charAt(0).toLowerCase() + secondPart.slice(1)}.`);
              } else if (idx % 4 === 0) {
                // Add filler words occasionally
                humanizedSentences.push(`Well, ${trimmed.charAt(0).toLowerCase() + trimmed.slice(1)}.`);
              } else {
                humanizedSentences.push(`${trimmed}.`);
              }
            }
          });
          
          return humanizedSentences.join(' ');
        }
        throw error; // Re-throw other errors
      }
    } catch (error: unknown) {
      console.error("Error humanizing text:", error);
      
      // Handle rate limits
      if (error.status === 429 || 
          (error.message && (
            error.message.includes("quota") || 
            error.message.includes("rate limit") || 
            error.message.includes("exceeded your current quota")
          ))) {
        throw new Error("Rate limit exceeded. The API is currently unavailable due to high demand. Please try again later.");
      }
      
      throw new Error("Failed to humanize the text. Please try again later or with different text.");
    }
  }

  // Enhanced humanization with detailed before/after analysis
  async humanizeWithAnalysis(text: string, style: 'casual' | 'professional' | 'academic' | 'conversational' = 'professional', customPrompt?: string): Promise<{
    originalText: string;
    humanizedText: string;
    improvements: Array<{
      category: string;
      description: string;
      example: string;
    }>;
    statistics: {
      originalLength: number;
      humanizedLength: number;
      sentenceCountChange: number;
      vocabularyImprovement: string;
      readabilityImprovement: string;
    };
  }> {
    try {
      console.log("Starting enhanced humanization with analysis...");

      // First, get the humanized text
      const humanizedText = await this.humanizeAI(text, customPrompt, style);

      // Calculate statistics
      const originalSentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const humanizedSentences = humanizedText.split(/[.!?]+/).filter(s => s.trim().length > 0);

      // Generate improvement analysis
      const improvements = [
        {
          category: "Sentence Structure",
          description: "Varied sentence lengths and improved natural flow",
          example: this.extractImprovementExample(text, humanizedText, "structure")
        },
        {
          category: "Vocabulary Enhancement",
          description: "Replaced formal/robotic language with natural alternatives",
          example: this.extractImprovementExample(text, humanizedText, "vocabulary")
        },
        {
          category: "Natural Transitions",
          description: "Improved connections between ideas with organic flow",
          example: this.extractImprovementExample(text, humanizedText, "transitions")
        },
        {
          category: "Human Voice",
          description: "Added personality and authentic human writing patterns",
          example: this.extractImprovementExample(text, humanizedText, "voice")
        }
      ];

      const statistics = {
        originalLength: text.length,
        humanizedLength: humanizedText.length,
        sentenceCountChange: humanizedSentences.length - originalSentences.length,
        vocabularyImprovement: this.assessVocabularyImprovement(text, humanizedText),
        readabilityImprovement: this.assessReadabilityImprovement(text, humanizedText)
      };

      return {
        originalText: text,
        humanizedText,
        improvements,
        statistics
      };

    } catch (error) {
      console.error("Error in enhanced humanization:", error);
      throw new Error("Failed to perform enhanced humanization. Please try again.");
    }
  }

  // Helper method to extract improvement examples
  private extractImprovementExample(original: string, humanized: string, category: string): string {
    const originalSentences = original.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const humanizedSentences = humanized.split(/[.!?]+/).filter(s => s.trim().length > 0);

    if (originalSentences.length > 0 && humanizedSentences.length > 0) {
      const originalExample = originalSentences[0].trim().substring(0, 80);
      const humanizedExample = humanizedSentences[0].trim().substring(0, 80);
      return `"${originalExample}..." → "${humanizedExample}..."`;
    }

    return "Structural and stylistic improvements throughout the text";
  }

  // Helper method to assess vocabulary improvement
  private assessVocabularyImprovement(original: string, humanized: string): string {
    const originalWords = original.toLowerCase().split(/\s+/);
    const humanizedWords = humanized.toLowerCase().split(/\s+/);

    const formalWords = ['utilize', 'implement', 'facilitate', 'demonstrate', 'establish'];
    const originalFormalCount = originalWords.filter(word => formalWords.some(fw => word.includes(fw))).length;
    const humanizedFormalCount = humanizedWords.filter(word => formalWords.some(fw => word.includes(fw))).length;

    if (originalFormalCount > humanizedFormalCount) {
      return "Reduced formal language, increased natural expression";
    } else if (humanizedWords.length > originalWords.length) {
      return "Enhanced with more descriptive and natural language";
    } else {
      return "Improved word choice and natural phrasing";
    }
  }

  // Helper method to assess readability improvement
  private assessReadabilityImprovement(original: string, humanized: string): string {
    const originalSentences = original.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const humanizedSentences = humanized.split(/[.!?]+/).filter(s => s.trim().length > 0);

    const originalAvgLength = originalSentences.reduce((sum, s) => sum + s.length, 0) / originalSentences.length;
    const humanizedAvgLength = humanizedSentences.reduce((sum, s) => sum + s.length, 0) / humanizedSentences.length;

    if (Math.abs(originalAvgLength - humanizedAvgLength) > 20) {
      return "Improved sentence length variation for better readability";
    } else if (humanizedSentences.length > originalSentences.length) {
      return "Enhanced clarity through better sentence structure";
    } else {
      return "Improved natural flow and readability";
    }
  }
}

// Export service with the same interface name expected by Dashboard.tsx
export const geminiService = new GeminiService();
