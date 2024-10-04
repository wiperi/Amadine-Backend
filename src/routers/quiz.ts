import { Router, Request, Response } from 'express';
import {
  adminQuizCreate,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizList,
  adminQuizQuestionMove,
  adminQuizDescriptionUpdate,
  adminQuizRemove,
  adminQuizQuestionCreate,
  adminQuizTrashView,
  adminQuizTrashEmpty,
  adminQuizQuestionDuplicate
} from '@/services/quiz';

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

quizRouter.get('/:quizid(\\d+)', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const { authUserId } = req.body;
  try {
    return res.json(adminQuizInfo(authUserId, quizid));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

quizRouter.put('/:quizid(\\d+)/name', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const { authUserId, name } = req.body;
  try {
    return res.json(adminQuizNameUpdate(authUserId, quizid, name));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

quizRouter.put('/:quizid(\\d+)/question/:questionid(\\d+)/move', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const questionid = parseInt(req.params.questionid);
  const { authUserId, newPosition } = req.body;
  try {
    return res.json(adminQuizQuestionMove(authUserId, quizid, questionid, newPosition));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

quizRouter.delete('/:quizid(\\d+)', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const { authUserId } = req.body;
  try {
    return res.json(adminQuizRemove(authUserId, quizid));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

quizRouter.put('/:quizid(\\d+)/description', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const { authUserId, description } = req.body;
  try {
    return res.json(adminQuizDescriptionUpdate(authUserId, quizid, description));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

quizRouter.post('/:quizId(\\d+)/question', (req, res) => {
  const { authUserId, questionBody } = req.body;
  const quizId = parseInt(req.params.quizId);
  try {
    return res.json(adminQuizQuestionCreate(authUserId, quizId, questionBody));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

quizRouter.get('/trash', (req: Request, res: Response) => {
  const { authUserId } = req.body;
  try {
    return res.json(adminQuizTrashView(authUserId));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

quizRouter.delete('/trash/empty', (req, res) => {
  const { authUserId } = req.body;
  const quizIds: number[] = JSON.parse(req.query.quizIds as string);
  try {
    return res.json(adminQuizTrashEmpty(authUserId, quizIds));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

quizRouter.post('/:quizId(\\d+)/question/:questionId(\\d+)/duplicate', (req: Request, res: Response) => {
  const { authUserId } = req.body;
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  try {
    return res.json(adminQuizQuestionDuplicate(authUserId, quizId, questionId));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});
