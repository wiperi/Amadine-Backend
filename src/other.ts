import { getData } from './dataStore';

/**
 * Reset the state of the application back to the start.
 */
export function clear(): Record<string, never> {
  getData().users = [];
  getData().quizzes = [];
  return {};
}
