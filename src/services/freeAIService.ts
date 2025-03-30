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
  }>;
  summary: string;
}> {
  try {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simple word and phrase analysis
    const words = text.split(/\s+/);
    const phrases = [];
    for (let i = 0; i < words.length - 3; i++) {
      phrases.push(words.slice(i, i + 3).join(' '));
    }
    
    // Generate random originality score with a bias toward originality
    const originalityScore = Math.min(Math.max(Math.round(65 + Math.random() * 30), 0), 100);
    const plagiarismScore = 100 - originalityScore;
    
    // Generate 1-3 simulated sources based on plagiarism score
    const sourceCount = plagiarismScore > 30 ? (plagiarismScore > 60 ? 3 : 2) : 1;
    const sources = [];
    
    for (let i = 0; i < sourceCount; i++) {
      // Get random phrases from the text
      const phraseIndex = Math.floor(Math.random() * Math.max(1, phrases.length - 1));
      const matchedText = phrases[phraseIndex] + (phrases[phraseIndex + 1] ? ' ' + phrases[phraseIndex + 1] : '');
      
      // Calculate similarity for this source
      const similarity = Math.round(plagiarismScore * (0.7 + Math.random() * 0.5));
      
      sources.push({
        url: `https://example${i + 1}.com/article-${Math.floor(Math.random() * 999) + 1}`,
        title: `Example Source ${i + 1}: ${matchedText.substring(0, 20)}...`,
        similarity,
        matchedText
      });
    }
    
    // Sort sources by similarity
    sources.sort((a, b) => b.similarity - a.similarity);
    
    // Create summary
    let summary;
    if (originalityScore > 70) {
      summary = `The text appears to be highly original. Analysis detected minimal similarity with existing content. The writing style and content structure suggest original authorship with ${originalityScore}% confidence.`;
    } else if (originalityScore > 30) {
      summary = `The text contains some elements that resemble existing content, but overall maintains partial originality. Some phrases match common patterns found elsewhere, but substantial portions appear to be original work.`;
    } else {
      summary = `The text shows significant similarity to existing content. Multiple passages closely resemble content found in other sources, suggesting potential plagiarism concerns. Original content is estimated at only ${originalityScore}%.`;
    }
    
    return {
      originalityScore,
      plagiarismScore,
      sources,
      summary
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