
// This is a helper module to manage API keys across components

// Create a way to manage the API key globally to avoid repetition
const apiKeyManager = {
  // Retrieve the API key from localStorage
  getApiKey: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gemini_api_key');
    }
    return null;
  },

  // Set the API key in localStorage and expose to the service
  setApiKey: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', key);
      // Set a global variable that can be accessed by the service
      (window as any).geminiApiKey = key;
    }
  },

  // Check if the API key exists
  hasApiKey: (): boolean => {
    return !!apiKeyManager.getApiKey();
  },

  // Clear the API key
  clearApiKey: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gemini_api_key');
      delete (window as any).geminiApiKey;
    }
  }
};

export default apiKeyManager;
