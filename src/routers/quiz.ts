import { Router, Request, Response } from 'express';

export const quizRouter = Router();

quizRouter.get('/', (req: Request, res: Response) => {
  return res.json({
    message: 'Quiz successful',
  });
});
