import { getData, quizSessionTimers, setData } from '@/dataStore';
import config from '@/config';
import fs from 'fs';
import path from 'path';
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

  quizSessionTimers.forEach(timer => clearTimeout(timer));
  quizSessionTimers.clear();

  // Remove all files in results path
  const resultsPath = config.resultsPath;
  if (fs.existsSync(resultsPath)) {
    fs.readdirSync(resultsPath).forEach(file => {
      fs.unlinkSync(path.join(resultsPath, file));
    });
  }

  setData();
  return {};
}
