/**
 * Utility functions for working with LocalStorage
 */

/**
 * Get a value from LocalStorage
 * @param key - The key to retrieve
 * @returns The parsed value or null if not found
 */
export function getLocalStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from LocalStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Set a value in LocalStorage
 * @param key - The key to store
 * @param value - The value to store (will be JSON stringified)
 */
export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to LocalStorage key "${key}":`, error);
  }
}

/**
 * Remove a value from LocalStorage
 * @param key - The key to remove
 */
export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from LocalStorage key "${key}":`, error);
  }
}

