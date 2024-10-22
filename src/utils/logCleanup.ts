import schedule from 'node-schedule';
import fs from 'fs';
import path from 'path';
import config from '@/config';

const LOG_PATH = config.logPath;

// Add log cleanup function
function cleanupLogs() {
  console.log('🧹 Checking for outdated logs...');
  const now = new Date().getTime();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000; // Timestamp of one week ago
  const fileSizeLimit = 5 * 1024 * 1024; // 5 MB

  fs.readdir(LOG_PATH, (err, files) => {
    if (err) {
      console.error('Error reading log directory:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(LOG_PATH, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting file stats for ${file}:`, err);
          return;
        }

        if (stats.mtimeMs < oneWeekAgo || stats.size > fileSizeLimit) {
          fs.writeFile(filePath, '', err => {
            if (err) {
              console.error(`Error emptying file ${file}:`, err);
            } else {
              console.log(`🧹 Emptied old log file: ${file}`);
            }
          });
        }
      });
    });
  });
}

export function cleanupLogsWeekly() {
  // Also run cleanup once when the server starts
  cleanupLogs();

  // Set up a scheduled task to run cleanup once a week
  schedule.scheduleJob('0 0 * * 0', cleanupLogs);
  console.log('🧹 Log cleanup scheduled to run weekly');
}
