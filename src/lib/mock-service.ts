// This is a mock implementation to prevent the app from breaking
// Replace with actual Gemini API integration when API key is available

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

class MockService {
  async checkPlagiarism(text: string): Promise<ContentAnalysisResult> {
    // Mock implementation - simulates API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a random score between 25 and 75 for more realistic results
    const score = Math.floor(Math.random() * 50) + 25;
    
    return {
      score,
      details: "The text contains several passages that appear to match content found on the web. The highlighted sections should be reviewed and either cited properly or rewritten.",
      suggestions: [
        "Review the highlighted sections for potential plagiarism",
        "Consider rewriting sections with high similarity scores",
        "Add proper citations for all sources"
      ],
      sources: [
        {
          text: text.substring(0, Math.min(40, text.length)) + "...",
          url: "https://example.com/academic-paper",
          similarity: Math.floor(Math.random() * 30) + 50,
          title: "Academic Research Paper"
        },
        {
          text: text.substring(Math.floor(text.length / 3), Math.min(Math.floor(text.length / 3) + 40, text.length)) + "...",
          url: "https://wikipedia.org/wiki/relevant-topic",
          similarity: Math.floor(Math.random() * 20) + 40,
          title: "Wikipedia Article"
        },
        {
          text: text.substring(Math.floor(text.length / 2), Math.min(Math.floor(text.length / 2) + 40, text.length)) + "...",
          url: "https://blog.example.org/content",
          similarity: Math.floor(Math.random() * 15) + 30,
          title: "Blog Post"
        }
      ]
    };
  }

  async detectAI(text: string): Promise<AIDetectionResult> {
    // Mock implementation - simulates API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a more realistic AI score based on text length and patterns
    const baseScore = Math.floor(Math.random() * 30) + 40; // Between 40 and 70
    
    // Adjust score based on text length (longer texts are harder to analyze)
    const lengthFactor = Math.min(text.length / 500, 1.5);
    const adjustedScore = Math.min(Math.floor(baseScore * lengthFactor), 98);

    // Generate confidence level based on the score
    const confidenceLevel = adjustedScore > 80 ? 'high' : adjustedScore > 60 ? 'medium' : 'low';
    
    // Generate human score (inverse of AI score but not exactly)
    const humanScore = Math.max(5, 100 - adjustedScore - Math.floor(Math.random() * 10));

    // Calculate mock text statistics
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const averageSentenceLength = sentences.length > 0 
      ? Math.floor(text.length / sentences.length) 
      : 0;
    
    // Generate pattern analysis
    const patternAnalysis: AIPatternAnalysis[] = [
      {
        name: 'Repetitive Structures',
        score: Math.floor(Math.random() * 50) + 30,
        description: 'Text contains repeated sentence structures and patterns common in AI-generated content',
        severity: Math.random() > 0.5 ? 'high' : 'medium'
      },
      {
        name: 'Vocabulary Diversity',
        score: Math.floor(Math.random() * 40) + 20,
        description: 'Limited word variety and overuse of certain phrases',
        severity: Math.random() > 0.6 ? 'medium' : 'low'
      },
      {
        name: 'Contextual Coherence',
        score: Math.floor(Math.random() * 60) + 30,
        description: 'Content maintains unusual consistency in tone and style throughout',
        severity: Math.random() > 0.4 ? 'high' : 'medium'
      },
      {
        name: 'Unusual Phrasing',
        score: Math.floor(Math.random() * 50) + 20,
        description: 'Contains formulaic expressions and awkward phrasing',
        severity: Math.random() > 0.5 ? 'medium' : 'low'
      },
      {
        name: 'Semantic Predictability',
        score: Math.floor(Math.random() * 70) + 20,
        description: 'Content follows highly predictable semantic patterns',
        severity: Math.random() > 0.3 ? 'high' : 'medium'
      }
    ];

    // Extract portions of text to highlight as examples
    const textParts = text.split(' ');
    const highlightedText = [];
    
    if (textParts.length > 10) {
      highlightedText.push({
        text: textParts.slice(0, 8).join(' ') + '...',
        reason: 'Generic opening structure common in AI writing',
        type: 'structure'
      });
    }
    
    if (textParts.length > 20) {
      highlightedText.push({
        text: textParts.slice(Math.floor(textParts.length / 3), Math.floor(textParts.length / 3) + 8).join(' ') + '...',
        reason: 'Repetitive transition pattern',
        type: 'pattern'
      });
    }
    
    if (textParts.length > 30) {
      highlightedText.push({
        text: textParts.slice(Math.floor(textParts.length / 2), Math.floor(textParts.length / 2) + 8).join(' ') + '...',
        reason: 'Consistent and formulaic sentence structure',
        type: 'structure'
      });
    }
    
    return {
      score: adjustedScore,
      humanScore,
      confidenceLevel,
      details: `This analysis indicates the text is ${adjustedScore}% likely to be AI-generated with a ${confidenceLevel} confidence level. The content exhibits several patterns typical of AI writing, including repetitive structures, limited vocabulary diversity, and consistent phrasing throughout. Human-written text typically contains more variation in syntax, personal expressions, and natural inconsistencies.`,
      suggestions: [
        "Add more varied sentence structures and lengths",
        "Incorporate personal anecdotes or unique perspectives",
        "Break predictable patterns with occasional informal language",
        "Use more specific examples and concrete details",
        "Vary vocabulary and avoid repetitive phrasing"
      ],
      patternAnalysis,
      textStatistics: {
        averageSentenceLength,
        vocabularyDiversity: Math.floor(Math.random() * 30) + 40,
        repetitivePhrasesCount: Math.floor(text.length / 200) + 2,
        uncommonWordsPercentage: Math.floor(Math.random() * 20) + 5
      },
      highlightedText
    };
  }

  async humanizeAI(text: string): Promise<string> {
    // Mock implementation - simulates API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a more natural humanized version of the input text
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    let humanizedText = '';
    
    if (paragraphs.length === 0) {
      return "Please provide some text to humanize.";
    }
    
    // Create a realistic paragraph structure
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      
      // Add variety to sentence structures and naturalize language
      const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
      let humanizedParagraph = '';
      
      // Process each sentence
      sentences.forEach((sentence, idx) => {
        // Apply humanization techniques
        let humanSentence = sentence.trim();
        
        // Vary sentence openings
        if (idx === 0 && Math.random() > 0.5) {
          const openings = [
            "In my experience, ", 
            "Interestingly, ", 
            "From what I understand, ",
            "I believe that ",
            "As many would agree, "
          ];
          humanSentence = openings[Math.floor(Math.random() * openings.length)] + 
            humanSentence.charAt(0).toLowerCase() + humanSentence.slice(1);
        }
        
        // Add common speech patterns and filler words occasionally
        if (Math.random() > 0.7) {
          const fillers = [
            " actually",
            " honestly",
            ", in a way,",
            ", you know,",
            " essentially"
          ];
          const randomPos = Math.floor(humanSentence.length / 2);
          const fillerWord = fillers[Math.floor(Math.random() * fillers.length)];
          humanSentence = 
            humanSentence.slice(0, randomPos) + 
            fillerWord + 
            humanSentence.slice(randomPos);
        }
        
        // Add slight imperfections or self-corrections
        if (Math.random() > 0.85) {
          const corrections = [
            " — or rather, ",
            " — I mean, ",
            " — actually, let me rephrase that: "
          ];
          const randomPos = Math.max(Math.floor(humanSentence.length * 0.6), 10);
          const correction = corrections[Math.floor(Math.random() * corrections.length)];
          humanSentence = 
            humanSentence.slice(0, randomPos) + 
            correction + 
            humanSentence.slice(randomPos);
        }
        
        // Finish the sentence
        humanizedParagraph += humanSentence + (sentence.endsWith('.') ? '. ' : sentence.endsWith('!') ? '! ' : sentence.endsWith('?') ? '? ' : '. ');
      });
      
      // Add paragraph transitions for more natural flow
      if (i > 0) {
        const transitions = [
          "Furthermore, ",
          "Additionally, ",
          "On another note, ",
          "It's also worth mentioning that ",
          "Another important consideration is that "
        ];
        
        if (Math.random() > 0.4) {
          humanizedParagraph = transitions[Math.floor(Math.random() * transitions.length)] + humanizedParagraph;
        }
      }
      
      humanizedText += humanizedParagraph.trim() + "\n\n";
    }
    
    // Add a conversational conclusion if text is long enough
    if (text.length > 200) {
      const conclusions = [
        "All things considered, I hope this perspective makes sense to you.",
        "These are just my thoughts on the matter, and I'd be interested to hear what you think.",
        "I've tried to approach this topic thoughtfully, though I'm always open to different viewpoints.",
        "I've given this considerable thought, and this is my honest take on it."
      ];
      
      humanizedText += conclusions[Math.floor(Math.random() * conclusions.length)];
    }
    
    return humanizedText.trim();
  }
}

// Export mock service with the same interface name expected by Dashboard.tsx
export const geminiService = new MockService(); 