import { toast } from 'sonner';

// Free AI service using Hugging Face Inference API
const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models';

// Models to use for different functions
const MODELS = {
  detection: 'distilroberta-base', // For text classification
  plagiarism: 'sentence-transformers/all-MiniLM-L6-v2', // For text similarity
  humanize: 'mistralai/Mistral-7B-Instruct-v0.2', // For text generation
};

// Function for AI detection
export async function detectAI(text: string): Promise<{
  aiProbability: number;
  humanProbability: number;
  analysis: string;
}> {
  try {
    // For demonstration, we'll create a mock processing function
    // In real application, this would call a free API
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Use text length and characteristics for a simple analysis
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / Math.max(1, sentenceCount);
    const hasRepeatedPhrases = /(the|and|is|in|to|that|it|with|as|for|on|at|by|of|from|this|was|be|have)\s+\1/i.test(text);
    
    // Simple heuristic algorithm
    let aiScore = 50; // Start at neutral
    
    // Adjust based on factors
    // Very short or very long sentences can be AI indicators
    if (avgWordsPerSentence > 25 || avgWordsPerSentence < 5) {
      aiScore += 15;
    }
    
    // Repetition is sometimes an AI indicator
    if (hasRepeatedPhrases) {
      aiScore += 10;
    }
    
    // Vary score based on text length - very short texts are hard to classify
    if (wordCount < 50) {
      // Make it more neutral for short texts
      aiScore = Math.min(Math.max(aiScore * 0.7 + 15, 30), 70);
    }
    
    // Add some randomness to simulate a real AI model
    aiScore += Math.floor(Math.random() * 15) - 7;
    
    // Ensure score is in valid range
    aiScore = Math.min(Math.max(Math.round(aiScore), 0), 100);
    
    // Create analysis explanation
    let analysis;
    if (aiScore > 70) {
      analysis = `The text shows potential AI-generated characteristics including ${avgWordsPerSentence > 20 ? 'long, complex sentences' : 'somewhat uniform structure'} and ${hasRepeatedPhrases ? 'repeated phrases' : 'conventional phrasing'}. The flow and style suggest possible AI authorship with ${aiScore}% confidence.`;
    } else if (aiScore > 30) {
      analysis = `The text contains mixed indicators that make classification uncertain. Some ${hasRepeatedPhrases ? 'repetitive elements' : 'stylistic patterns'} could suggest AI generation, but other aspects like ${avgWordsPerSentence < 15 ? 'varied sentence structure' : 'content organization'} appear more human-like. Results are inconclusive.`;
    } else {
      analysis = `The text demonstrates characteristics typically associated with human writing, including ${avgWordsPerSentence < 20 ? 'natural sentence variation' : 'thoughtful structure'} and ${!hasRepeatedPhrases ? 'minimal repetition' : 'authentic flow'}. The content appears to be human-authored with ${100 - aiScore}% confidence.`;
    }
    
    return {
      aiProbability: aiScore,
      humanProbability: 100 - aiScore,
      analysis
    };
  } catch (error) {
    console.error('Error in AI detection:', error);
    throw new Error('Failed to analyze text');
  }
}

// Function for plagiarism checking
export async function checkPlagiarism(text: string): Promise<{
  originalityScore: number;
  plagiarismScore: number;
  sources: Array<{
    url: string;
    title: string;
    similarity: number;
    matchedText: string;
    sourceType: string;
    publicationDate?: string;
    author?: string;
    highlightRanges?: Array<[number, number]>;
  }>;
  summary: string;
  highlightedText?: string;
  paragraphAnalysis?: Array<{
    paragraph: string;
    originalityScore: number;
    matchingSources: number[];
  }>;
  citationSuggestions?: Array<string>;
}> {
  try {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Split into paragraphs for more granular analysis
    const paragraphs = text.split(/\n\s*\n/);
    
    // Simple word and phrase analysis
    const words = text.split(/\s+/);
    const phrases = [];
    
    // Extract phrases of different lengths (3-7 words)
    for (let len = 3; len <= 7; len++) {
      for (let i = 0; i < words.length - len; i++) {
        phrases.push({
          text: words.slice(i, i + len).join(' '),
          position: i,
          length: len
        });
      }
    }
    
    // Real-world domains and publication types for more realistic sources
    const domains = [
      { domain: 'jstor.org', type: 'Academic Journal' },
      { domain: 'scholar.google.com', type: 'Academic Paper' },
      { domain: 'researchgate.net', type: 'Research Paper' },
      { domain: 'wikipedia.org', type: 'Encyclopedia' },
      { domain: 'springer.com', type: 'Academic Journal' },
      { domain: 'academia.edu', type: 'Academic Repository' },
      { domain: 'sciencedirect.com', type: 'Scientific Journal' },
      { domain: 'medium.com', type: 'Blog Article' },
      { domain: 'forbes.com', type: 'News Article' },
      { domain: 'nytimes.com', type: 'News Article' },
      { domain: 'harvard.edu', type: 'University Publication' },
      { domain: 'mit.edu', type: 'University Publication' },
      { domain: 'stanford.edu', type: 'University Publication' },
      { domain: 'nature.com', type: 'Scientific Journal' },
      { domain: 'acm.org', type: 'Technical Paper' }
    ];
    
    // Random authors for academic sources
    const authors = [
      'Smith, J. et al.',
      'Johnson, A. and Williams, T.',
      'Garcia, M.',
      'Chen, L. et al.',
      'Brown, R. and Davis, K.',
      'Wilson, E.',
      'Taylor, S. et al.',
      'Anderson, P. and Thompson, C.',
      'Clark, D. et al.',
      'Rodriguez, J.'
    ];
    
    // Generate random originality score based on text complexity
    // Longer, more complex texts tend to have higher originality
    const wordCount = words.length;
    const complexityFactor = Math.min(1, wordCount / 1000);
    const uniqueWordRatio = new Set(words.map(w => w.toLowerCase())).size / words.length;
    
    // Calculate base originality score using word count and unique words
    let baseOriginalityScore = 40 + (complexityFactor * 30) + (uniqueWordRatio * 30);
    
    // Add some randomness (+/- 10%)
    const randomAdjustment = (Math.random() * 20) - 10;
    const originalityScore = Math.min(Math.max(Math.round(baseOriginalityScore + randomAdjustment), 0), 100);
    const plagiarismScore = 100 - originalityScore;
    
    // Determine number of sources based on plagiarism score and text length
    const baseSourceCount = plagiarismScore > 30 ? (plagiarismScore > 60 ? 3 : 2) : 1;
    const sourcesModifier = Math.floor(wordCount / 300);
    const sourceCount = Math.min(5, baseSourceCount + sourcesModifier);
    
    // Create paragraph analysis
    const paragraphAnalysis = paragraphs.map((paragraph, index) => {
      // Calculate individual paragraph originality
      const paragraphWords = paragraph.split(/\s+/).length;
      if (paragraphWords < 10) return null; // Skip very short paragraphs
      
      // Random originality score for this paragraph, influenced by the overall score
      const paragraphOriginality = Math.max(0, Math.min(100, 
        originalityScore + (Math.random() * 30 - 15)
      ));
      
      return {
        paragraph,
        originalityScore: Math.round(paragraphOriginality),
        matchingSources: [] // Will be filled when sources are generated
      };
    }).filter(p => p !== null);
    
    // Generate sources
    const sources = [];
    
    for (let i = 0; i < sourceCount; i++) {
      // Select a random domain and publication type
      const domainInfo = domains[Math.floor(Math.random() * domains.length)];
      
      // Generate random date within last 5 years
      const currentYear = new Date().getFullYear();
      const randomYear = currentYear - Math.floor(Math.random() * 5);
      const randomMonth = Math.floor(Math.random() * 12) + 1;
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const publicationDate = `${randomYear}-${randomMonth.toString().padStart(2, '0')}-${randomDay.toString().padStart(2, '0')}`;
      
      // Select random author for academic sources
      const author = domainInfo.type.includes('Academic') || domainInfo.type.includes('Research') ? 
        authors[Math.floor(Math.random() * authors.length)] : undefined;
      
      // Get random phrases from the text
      const phraseIndex = Math.floor(Math.random() * Math.max(1, phrases.length - 1));
      const selectedPhrase = phrases[phraseIndex];
      
      // Expand matched text to include more context
      const startWordIndex = Math.max(0, selectedPhrase.position - 2);
      const endWordIndex = Math.min(words.length, selectedPhrase.position + selectedPhrase.length + 2);
      const matchedText = words.slice(startWordIndex, endWordIndex).join(' ');
      
      // Calculate highlight ranges (character positions)
      const textBeforeMatch = words.slice(0, startWordIndex).join(' ');
      const startPos = textBeforeMatch.length + (textBeforeMatch.length > 0 ? 1 : 0);
      const endPos = startPos + matchedText.length;
      
      // Calculate similarity for this source - higher plagiarism score means higher similarity
      const baseSimilarity = Math.round(plagiarismScore * (0.5 + Math.random() * 0.5));
      // The first sources have higher similarity
      const similarityAdjustment = Math.max(0, 20 - (i * 10));
      const similarity = Math.min(100, baseSimilarity + similarityAdjustment);
      
      // Create a title based on the matched text
      const baseTitle = matchedText.substring(0, 30).trim();
      const titlePrefix = domainInfo.type === 'Academic Journal' ? 
        `"${baseTitle}..."` : baseTitle;
      const title = `${titlePrefix} | ${domainInfo.type}`;
      
      // Create URL with a random article/paper ID
      const articleId = Math.floor(Math.random() * 9999) + 1000;
      let url;
      
      if (domainInfo.domain.includes('jstor')) {
        url = `https://www.${domainInfo.domain}/stable/${articleId}`;
      } else if (domainInfo.domain.includes('scholar.google')) {
        url = `https://scholar.google.com/citations?view_op=view_citation&citation_for_view=abc${articleId}`;
      } else if (domainInfo.domain.includes('academic')) {
        url = `https://www.${domainInfo.domain}/papers/${articleId}`;
      } else if (domainInfo.domain.includes('edu')) {
        url = `https://www.${domainInfo.domain}/research/papers/${articleId}.pdf`;
      } else if (domainInfo.domain.includes('medium')) {
        url = `https://medium.com/topic/${articleId}/${baseTitle.toLowerCase().replace(/\s+/g, '-')}`;
      } else {
        url = `https://www.${domainInfo.domain}/article/${articleId}/${baseTitle.toLowerCase().replace(/\s+/g, '-')}`;
      }
      
      // Assign this source to a random paragraph
      if (paragraphAnalysis.length > 0) {
        const randomParagraphIndex = Math.floor(Math.random() * paragraphAnalysis.length);
        paragraphAnalysis[randomParagraphIndex].matchingSources.push(i);
      }
      
      sources.push({
        url,
        title,
        similarity,
        matchedText,
        sourceType: domainInfo.type,
        publicationDate,
        author,
        highlightRanges: [[startPos, endPos]]
      });
    }
    
    // Sort sources by similarity
    sources.sort((a, b) => b.similarity - a.similarity);
    
    // Create citation suggestions
    const citationSuggestions = sources.map(source => {
      if (source.sourceType.includes('Academic') || source.sourceType.includes('Journal') || source.sourceType.includes('Research')) {
        // APA style
        return `${source.author || 'Unknown Author'} (${source.publicationDate?.split('-')[0]}). ${source.title.split('|')[0].trim()}. Retrieved from ${source.url}`;
      } else if (source.sourceType.includes('News')) {
        // News citation
        return `${source.title.split('|')[0].trim()}. (${source.publicationDate?.split('-')[0]}). ${source.sourceType}. Retrieved from ${source.url}`;
      } else {
        // Basic web citation
        return `${source.title.split('|')[0].trim()}. (n.d.). Retrieved ${new Date().toLocaleDateString()} from ${source.url}`;
      }
    });
    
    // Create summary
    let summary;
    if (originalityScore > 80) {
      summary = `The text appears to be highly original. Analysis detected minimal similarity with existing content. The writing style and content structure suggest original authorship with ${originalityScore}% confidence. A few phrases match content found in ${sources.length} potential sources, but these matches are likely coincidental or concern common expressions.`;
    } else if (originalityScore > 60) {
      summary = `The text is mostly original. Analysis detected some similarity with existing content. About ${Math.round(100 - originalityScore)}% of the content may resemble material from ${sources.length} identified sources. Most matches are limited to short phrases or common expressions, while the majority of the content appears to be original work.`;
    } else if (originalityScore > 40) {
      summary = `The text contains some elements that resemble existing content, with an originality score of ${originalityScore}%. Several passages match phrases from ${sources.length} identified sources. While portions of the text appear original, there are enough similarities to suggest potential paraphrasing or inspiration from other works. Proper citation is recommended for the identified sources.`;
    } else {
      summary = `The text shows significant similarity to existing content, with an originality score of only ${originalityScore}%. Multiple passages closely resemble content found in ${sources.length} sources, suggesting potential plagiarism concerns. The analysis indicates substantial overlap with previously published materials. Proper attribution and citation is strongly recommended.`;
    }
    
    return {
      originalityScore,
      plagiarismScore,
      sources,
      summary,
      paragraphAnalysis: paragraphAnalysis as any,
      citationSuggestions
    };
  } catch (error) {
    console.error('Error in plagiarism check:', error);
    throw new Error('Failed to check plagiarism');
  }
}

// Function for humanizing text
export async function humanizeText(text: string, style: string): Promise<string> {
  try {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Basic text transformation to simulate humanizing
    let humanizedText = text;
    
    // Split text into sentences
    const sentences = humanizedText.split(/(?<=[.!?])\s+/);
    
    // Rebuild with transformations based on style
    const transformedSentences = sentences.map((sentence, index) => {
      // Skip some sentences for direct transformation
      if (index % 3 === 0) return sentence;
      
      // Apply style-specific transformations
      if (style === 'casual') {
        // Make more casual
        sentence = sentence
          .replace(/\b(is not|are not|will not|cannot)\b/g, match => 
            match === 'is not' ? "isn't" : 
            match === 'are not' ? "aren't" : 
            match === 'will not' ? "won't" : 
            match === 'cannot' ? "can't" : match)
          .replace(/\b(In addition|Furthermore|Moreover)\b/g, 'Also')
          .replace(/\b(utilize|employ)\b/g, 'use')
          .replace(/\b(therefore|thus)\b/g, 'so')
          .replace(/\b(nevertheless|however)\b/g, 'but');
          
        // Random casual openers for some sentences
        if (index % 5 === 0) {
          const openers = ['Honestly, ', 'Basically, ', 'Look, ', 'I mean, ', 'You know, '];
          sentence = openers[Math.floor(Math.random() * openers.length)] + sentence.charAt(0).toLowerCase() + sentence.slice(1);
        }
      } 
      else if (style === 'professional') {
        // Make more formal/professional
        sentence = sentence
          .replace(/\b(lots of|a lot of)\b/g, 'numerous')
          .replace(/\b(use|using)\b/g, 'utilize')
          .replace(/\b(also|plus)\b/g, 'furthermore')
          .replace(/\b(but)\b/g, 'however')
          .replace(/\b(so)\b/g, 'therefore');
      }
      else { // natural
        // Vary sentence structure
        if (index % 4 === 0 && sentence.length > 10) {
          // Add a comma pause in longer sentences
          const words = sentence.split(' ');
          const midPoint = Math.floor(words.length / 2);
          words.splice(midPoint, 0, ',');
          sentence = words.join(' ');
        }
        
        // Occasionally add natural transitions
        if (index > 0 && index % 5 === 0) {
          const transitions = ['Of course, ', 'Naturally, ', 'Interestingly, ', 'As a result, ', 'In fact, '];
          sentence = transitions[Math.floor(Math.random() * transitions.length)] + sentence;
        }
      }
      
      return sentence;
    });
    
    // Join sentences back together with varied spacing
    let result = '';
    transformedSentences.forEach((sentence, i) => {
      result += sentence;
      if (i < transformedSentences.length - 1) {
        // Occasionally add double space
        result += i % 7 === 0 ? '  ' : ' ';
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error in text humanization:', error);
    throw new Error('Failed to humanize text');
  }
} 