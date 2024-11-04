import express, { json, Request, Response, NextFunction } from 'express';
import { echo } from './utils/newecho';
import morgan from 'morgan';
import config from './_config';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import os from 'os';
import http from 'http';

// Import routers
import router from './routes';

import { loadData } from './dataStore';
import { authorizeToken } from './services/auth';
import { HttpError } from './utils/HttpError';
import { cleanupLogsWeekly } from './utils/logCleanup';

// Import winston logger for error logging
import logger from './utils/logger';

const LOG_PATH = config.logPath;

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());

// Setup log log cleanup
cleanupLogsWeekly();

// serve static files
app.use(express.static(config.publicPath));

// for logging requests (print to file)
const logStream = fs.createWriteStream(path.join(LOG_PATH, 'access.log'), { flags: 'a' });
// - self-defined token for morgan formatting
morgan.token('query', (req: Request) => JSON.stringify(req.query, null, 2));
morgan.token('params', (req: Request) => JSON.stringify(req.params, null, 2));
morgan.token('body', (req: Request) => JSON.stringify(req.body, null, 2));
// - morgan logging format, using combined format plus query and body
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"\nquery: :query\nparams: :params\nbody: :body\n',
    { stream: logStream }
  )
);

// for logging errors (print to terminal)
app.use(morgan('dev'));

// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use(
  '/docs',
  sui.serve,
  sui.setup(YAML.parse(file), {
    swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' },
  })
);

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Load data on server start
(() => {
  loadData();
  console.log('📊 Server data loaded');
})();

// Example get request
app.get('/echo', (req: Request, res: Response, next: NextFunction) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    return next(new HttpError(400, result.error));
  }

  return res.json(result);
});

app.use(authorizeToken);

// Pass all requests to the router
app.use('/', router);

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode);
  res.json({ error: message });

  // winston log error response
  logger.error({
    timestamp: Date.now(),
    date: new Date().toUTCString(),
    req: {
      httpVersion: req.httpVersion,
      headers: req.headers,
      originalUrl: req.originalUrl,
      url: req.url,
      method: req.method,
      query: req.query,
      params: req.params,
      body: req.body,
    },
    res: {
      statusCode: statusCode,
      error: http.STATUS_CODES[statusCode],
      message: message,
    },
    stack: err.stack?.split('\n'),
    process: {
      pid: process.pid,
      uid: process.getuid?.(),
      gid: process.getgid?.(),
      cwd: process.cwd(),
      execPath: process.execPath,
      version: process.version,
      argv: process.argv,
      memoryUsage: process.memoryUsage(),
    },
    os: {
      name: process.platform,
      version: process.version,
      uptime: process.uptime(),
      loadavg: os.loadavg(),
    },
  });
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  return next(new HttpError(404, error));
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
