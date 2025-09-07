
// This is a helper module to manage API keys across components

// Create a way to manage the API key globally to avoid repetition
const apiKeyManager = {
  // Constants for storage keys
  API_KEY_STORAGE_KEY: 'openrouter_api_key',
  
  // Retrieve the API key from environment variables, localStorage, or return null
  getApiKey: (): string | null => {
    if (typeof window !== 'undefined') {
      // First try to get from environment variable (updated to use OPENROUTER)
      const envKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
      if (envKey && envKey.trim() !== '') {
        (window as any).openrouterApiKey = envKey;
        return envKey;
      }
      
      // Fall back to localStorage
      const storedKey = localStorage.getItem(apiKeyManager.API_KEY_STORAGE_KEY);
      if (storedKey && storedKey.trim() !== '') {
        (window as any).openrouterApiKey = storedKey;
        return storedKey;
      }
      
      return null;
    }
    
    // Server-side: only check environment variable
    const envKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    return envKey && envKey.trim() !== '' ? envKey : null;
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
      (window as any).openrouterApiKey = key;
      
      // Dispatch an event to notify other components about the API key change
      const event = new CustomEvent('apikey-changed', { detail: key });
      window.dispatchEvent(event);
      console.log("OpenRouter API key updated successfully");
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
      delete (window as any).openrouterApiKey;
      
      // Dispatch an event to notify other components about the API key change
      const event = new CustomEvent('apikey-changed', { detail: null });
      window.dispatchEvent(event);
      console.log("OpenRouter API key cleared successfully");
    }
  },
  
  // Validate the API key format (basic validation)
  validateApiKey: (key: string): boolean => {
    // Basic validation for OpenRouter API key format
    // OpenRouter API keys start with "sk-or-v1-" followed by alphanumeric characters
    // Also support legacy Gemini keys for backward compatibility
    if (!key || key.trim() === '') return false;
    
    const trimmedKey = key.trim();
    
    // OpenRouter key format: sk-or-v1-...
    if (trimmedKey.startsWith('sk-or-v1-') && trimmedKey.length >= 20) {
      return true;
    }
    
    // Legacy Gemini key format: AIza...
    if (trimmedKey.startsWith('AIza') && trimmedKey.length >= 20) {
      return true;
    }
    
    return false;
  }
};

export default apiKeyManager;
