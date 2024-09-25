import { Router, Request, Response } from 'express';

export const authRouter = Router();

authRouter.get('/', (req: Request, res: Response) => {
  return res.json({
    message: 'Auth successful',
  });
});