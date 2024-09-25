import { Router, Request, Response } from 'express';

export const playerRouter = Router();

playerRouter.get('/', (req: Request, res: Response) => {
  return res.json({
    message: 'Player successful',
  });
});