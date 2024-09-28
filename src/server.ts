import express, { json, Request, Response, NextFunction } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';

// Import routers
import { authRouter } from './routers/auth';
import { quizRouter } from './routers/quiz';
import { userRouter } from './routers/user';
import { playerRouter } from './routers/player';

import { loadData } from './dataStore';
import { clear } from './other';
import { authorizeToken } from './auth';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());

// for logging requests (print to file)
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
// - self-defined token for morgan formatting
morgan.token('query', (req: Request) => JSON.stringify(req.query, null, 2));
morgan.token('body', (req: Request) => JSON.stringify(req.body, null, 2));
// - morgan logging format, using combined format plus query and body
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"\nquery: :query\nbody: :body\n', { stream: logStream }));

// for logging errors (print to terminal)
app.use(morgan('dev'));

// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Load data on very first request
let dataLoaded = false;
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!dataLoaded) {
    loadData();
    console.log('📊 Data loaded');
    dataLoaded = true;
  }
  next();
});

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(400);
  }

  return res.json(result);
});

app.use(authorizeToken);

app.use('/v1/admin/auth', authRouter);
app.use('/v1/admin/quiz', quizRouter);
app.use('/v1/admin/user', userRouter);
app.use('/v1/player', playerRouter);

app.delete('/v1/clear', (req: Request, res: Response) => {
  return res.status(200).json(clear());
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
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
  res.status(404).json({ error });
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
