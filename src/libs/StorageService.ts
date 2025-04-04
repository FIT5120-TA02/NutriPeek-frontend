/**
 * StorageService.ts
 * A service for interacting with browser's localStorage and sessionStorage
 * with type safety and server-side rendering considerations
 */

// Type definitions for storage items
export interface StorageItem<T> {
  key: string;
  defaultValue?: T;
}

// Main storage service class
export class StorageService {
  // Check if window is defined (client-side)
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // Local Storage Methods
  
  /**
   * Set an item in localStorage
   * @param key The key to store the value under
   * @param value The value to store
   */
  setLocalItem<T>(key: string, value: T): void {
    if (!this.isClient()) return;
    
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }

  /**
   * Get an item from localStorage
   * @param item The storage item configuration
   * @returns The stored value or the default value
   */
  getLocalItem<T>(item: StorageItem<T>): T | undefined {
    if (!this.isClient()) return item.defaultValue;
    
    try {
      const serializedValue = localStorage.getItem(item.key);
      if (serializedValue === null) return item.defaultValue;
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Error getting localStorage key "${item.key}":`, error);
      return item.defaultValue;
    }
  }

  /**
   * Remove an item from localStorage
   * @param key The key to remove
   */
  removeLocalItem(key: string): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }

  /**
   * Clear all items from localStorage
   */
  clearLocalStorage(): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Session Storage Methods
  
  /**
   * Set an item in sessionStorage
   * @param key The key to store the value under
   * @param value The value to store
   */
  setSessionItem<T>(key: string, value: T): void {
    if (!this.isClient()) return;
    
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  }

  /**
   * Get an item from sessionStorage
   * @param item The storage item configuration
   * @returns The stored value or the default value
   */
  getSessionItem<T>(item: StorageItem<T>): T | undefined {
    if (!this.isClient()) return item.defaultValue;
    
    try {
      const serializedValue = sessionStorage.getItem(item.key);
      if (serializedValue === null) return item.defaultValue;
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Error getting sessionStorage key "${item.key}":`, error);
      return item.defaultValue;
    }
  }

  /**
   * Remove an item from sessionStorage
   * @param key The key to remove
   */
  removeSessionItem(key: string): void {
    if (!this.isClient()) return;
    
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }

  /**
   * Clear all items from sessionStorage
   */
  clearSessionStorage(): void {
    if (!this.isClient()) return;
    
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }
}

// Create a singleton instance
const storageService = new StorageService();

export default storageService;