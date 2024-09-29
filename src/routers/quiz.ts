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
  const { quizid } = req.params;
  try {
    const quizIdNumber = parseInt(quizid);
    const result = adminQuizInfo(req.body.authUserId, quizIdNumber);
    return res.json(result);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});
