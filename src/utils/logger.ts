import winston from "winston";
import path from "path";
import config from "@/config";

const LOG_PATH = config.logPath;

const fileFormat = winston.format.printf((logObj) => {
  return JSON.stringify(logObj.message, null, 2);
});

const consoleFormat = winston.format.printf((logObj) => {
  const { res, req } = logObj.message;
  const message = {
    req: req,
    res: res
  }
  return JSON.stringify(message, null, 2);
});

// create winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    fileFormat
  ),
  transports: [
    new winston.transports.Console({
      level: 'error',
      format: winston.format.combine(
        consoleFormat
      )
    }),
    new winston.transports.File({ filename: path.join(LOG_PATH, 'error.log'), level: 'error' }),
    // new winston.transports.File({ filename: path.join(LOG_PATH, 'combined.log') }),
  ],
});

export default logger;