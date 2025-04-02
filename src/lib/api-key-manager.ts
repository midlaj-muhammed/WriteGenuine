
// This is a helper module to manage API keys across components

// Create a way to manage the API key globally to avoid repetition
const apiKeyManager = {
  // Retrieve the API key from localStorage
  getApiKey: (): string | null => {
    if (typeof window !== 'undefined') {
      const key = localStorage.getItem('gemini_api_key');
      
      // Also set it on the window object for easy access by services
      if (key) {
        (window as any).geminiApiKey = key;
      }
      
      return key;
    }
    return null;
  },

  // Set the API key in localStorage and expose to the service
  setApiKey: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', key);
      // Set a global variable that can be accessed by the service
      (window as any).geminiApiKey = key;
      
      // Dispatch an event to notify other components about the API key change
      const event = new CustomEvent('apikey-changed', { detail: key });
      window.dispatchEvent(event);
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
      
      // Dispatch an event to notify other components about the API key change
      const event = new CustomEvent('apikey-changed', { detail: null });
      window.dispatchEvent(event);
    }
  }
};

export default apiKeyManager;
