import { Router, Request, Response } from 'express';

export const quizRouter = Router();

quizRouter.get('/', (req: Request, res: Response) => {
  return res.status(200).json({ message: 'Quiz route' });
});
