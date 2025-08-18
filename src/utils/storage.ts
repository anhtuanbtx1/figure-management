// Storage utility to fix redux-persist warnings
// This provides a fallback for localStorage in SSR environments

interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// Create a noop storage for SSR
const createNoopStorage = (): Storage => {
  return {
    getItem(_key: string): string | null {
      return null;
    },
    setItem(_key: string, _value: string): void {
      // noop
    },
    removeItem(_key: string): void {
      // noop
    },
  };
};

// Create storage that works in both SSR and client
const createStorage = (): Storage => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  
  // Fallback to noop storage for SSR
  return createNoopStorage();
};

export const storage = createStorage();

// Export for redux-persist config
export default storage;
