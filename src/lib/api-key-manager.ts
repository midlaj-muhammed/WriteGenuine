// This is a helper module to manage API keys across components

// Create a way to manage the API key globally to avoid repetition
const apiKeyManager = {
  // Constants for storage keys
  API_KEY_STORAGE_KEY: 'gemini_api_key',
  DEFAULT_API_KEY: 'AIzaSyCnISefZYuKmf-5o7lcC64pRZhwebgSnj4', // TODO: Replace with your actual Google Gemini API key
  
  // Retrieve the API key from localStorage or use the default
  getApiKey: (): string | null => {
    if (typeof window !== 'undefined') {
      const key = localStorage.getItem(apiKeyManager.API_KEY_STORAGE_KEY) || apiKeyManager.DEFAULT_API_KEY;
      
      // Also set it on the window object for easy access by services
      if (key) {
        (window as any).geminiApiKey = key;
      }
      
      return key;
    }
    return apiKeyManager.DEFAULT_API_KEY;
  },

  // Set the API key in localStorage and expose to the service
  setApiKey: (key: string): void => {
    if (!key || key.trim() === '') {
      console.error("Attempted to set empty API key");
      return;
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(apiKeyManager.API_KEY_STORAGE_KEY, key);
      // Set a global variable that can be accessed by the service
      (window as any).geminiApiKey = key;
      
      // Dispatch an event to notify other components about the API key change
      const event = new CustomEvent('apikey-changed', { detail: key });
      window.dispatchEvent(event);
      console.log("API key saved and event dispatched");
    }
  },

  // Check if the API key exists
  hasApiKey: (): boolean => {
    const key = apiKeyManager.getApiKey();
    return !!key && key.trim() !== '';
  },

  // Clear the API key
  clearApiKey: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(apiKeyManager.API_KEY_STORAGE_KEY);
      delete (window as any).geminiApiKey;
      
      // Dispatch an event to notify other components about the API key change
      const event = new CustomEvent('apikey-changed', { detail: null });
      window.dispatchEvent(event);
      console.log("API key cleared and event dispatched");
    }
  },
  
  // Validate the API key format (basic validation)
  validateApiKey: (key: string): boolean => {
    // Basic validation for Google AI API key format
    // Real Google API keys usually start with "AI" followed by alphanumeric characters
    return !!key && key.trim() !== '' && key.length >= 20;
  }
};

export default apiKeyManager;
