import { getData, setData } from '../dataStore';

/**
 * Reset the state of the application back to the start.
 */
export function clear(): Record<string, never> {
  const data = getData();
  data.users = [];
  data.quizzes = [];
  data.userSessions = [];
  data.quizSessions = [];
  data.players = [];

  setData();
  return {};
}
