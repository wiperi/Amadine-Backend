import { Router, Request, Response } from 'express';
import { adminQuizCreate, adminQuizInfo, adminQuizNameUpdate, adminQuizDescriptionUpdate, adminQuizList } from '../quiz';
export const quizRouter = Router();

quizRouter.post('/', (req: Request, res: Response) => {
  const { authUserId, name, description } = req.body;
  try {
    return res.json(adminQuizCreate(authUserId, name, description));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

quizRouter.get('/list', (req: Request, res: Response) => {
  const { authUserId } = req.body;
  try {
    return res.json(adminQuizList(authUserId));
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

quizRouter.put('/:quizid/name', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const { authUserId, name } = req.body;
  try {
    return res.json(adminQuizNameUpdate(authUserId, quizid, name));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});
quizRouter.put('/:quizid/description', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const { authUserId, description } = req.body;
  try {
    return res.json(adminQuizDescriptionUpdate(authUserId, quizid, description));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});
