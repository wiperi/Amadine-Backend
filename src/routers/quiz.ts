import { Router, Request, Response } from 'express';
import { adminQuizCreate, adminQuizInfo } from '../quiz';
export const quizRouter = Router();

quizRouter.get('/', (req: Request, res: Response) => {
  return res.status(200).json({ message: 'Quiz route' });
});

quizRouter.post('/', (req: Request, res: Response) => {
  const { authUserId, name, description } = req.body;
  try {
    return res.json(adminQuizCreate(authUserId, name, description));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

quizRouter.get('/:quizid', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const { authUserId } = req.body;
  try {
    return res.json(adminQuizInfo(authUserId, quizid));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});
