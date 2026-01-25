/**
 * UI utilities for user interactions
 * Replaces direct alert/confirm calls
 */

export const showAlert = (message: string) => {
  if (typeof window !== 'undefined') {
    alert(message);
  }
};

export const showConfirm = (message: string): boolean => {
  if (typeof window !== 'undefined') {
    return confirm(message);
  }
  return false;
};
