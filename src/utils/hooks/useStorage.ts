/**
 * useStorage.ts
 * React hooks for using storage with state synchronization
 */

import { useState, useEffect, useCallback } from 'react';
import storageService, { StorageItem } from '@/libs/StorageService';

/**
 * Hook for using localStorage with React state
 * @param item Storage item configuration
 * @returns [storedValue, setValue, removeValue]
 */
export function useLocalStorage<T>(item: StorageItem<T>): [
  T | undefined,
  (value: T) => void,
  () => void
] {
  // Initialize with value from storage or default
  const [storedValue, setStoredValue] = useState<T | undefined>(() => {
    return storageService.getLocalItem(item);
  });

  // Update localStorage and state when value changes
  const setValue = useCallback((value: T) => {
    setStoredValue(value);
    storageService.setLocalItem(item.key, value);
  }, [item.key]);

  // Remove value from localStorage and reset state to default
  const removeValue = useCallback(() => {
    setStoredValue(item.defaultValue);
    storageService.removeLocalItem(item.key);
  }, [item.defaultValue, item.key]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for using sessionStorage with React state
 * @param item Storage item configuration
 * @returns [storedValue, setValue, removeValue]
 */
export function useSessionStorage<T>(item: StorageItem<T>): [
  T | undefined,
  (value: T) => void,
  () => void
] {
  // Initialize with value from storage or default
  const [storedValue, setStoredValue] = useState<T | undefined>(() => {
    return storageService.getSessionItem(item);
  });

  // Update sessionStorage and state when value changes
  const setValue = useCallback((value: T) => {
    setStoredValue(value);
    storageService.setSessionItem(item.key, value);
  }, [item.key]);

  // Remove value from sessionStorage and reset state to default
  const removeValue = useCallback(() => {
    setStoredValue(item.defaultValue);
    storageService.removeSessionItem(item.key);
  }, [item.defaultValue, item.key]);

  return [storedValue, setValue, removeValue];
}