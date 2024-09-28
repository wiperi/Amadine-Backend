import { Router, Request, Response } from 'express';

export const playerRouter = Router();

// test route
playerRouter.get('/', (req: Request, res: Response) => {
  return res.status(200).json({ message: 'Player route' });
});
