import { Router, Request, Response, NextFunction } from 'express';
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
  adminQuizQuestionDelete,
  adminQuizQuestionDuplicate,
  adminQuizRestore,
  adminQuizTransfer,
  adminQuizQuestionUpdate
} from '@/services/quiz';
import { tryCatch } from '@/utils/helper';

export const quizRouter = Router();

quizRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  const { authUserId, name, description } = req.body;
  tryCatch(() => adminQuizCreate(authUserId, name, description), req, res, next);
});

quizRouter.get('/list', (req: Request, res: Response, next: NextFunction) => {
  const { authUserId } = req.body;
  tryCatch(() => adminQuizList(authUserId), req, res, next);
});

quizRouter.get('/:quizid(-?\\d+)', (req: Request, res: Response, next: NextFunction) => {
  const quizid = parseInt(req.params.quizid);
  const { authUserId } = req.body;
  tryCatch(() => adminQuizInfo(authUserId, quizid), req, res, next);
});

quizRouter.put('/:quizid(-?\\d+)/name', (req: Request, res: Response, next: NextFunction) => {
  const quizid = parseInt(req.params.quizid);
  const { authUserId, name } = req.body;
  tryCatch(() => adminQuizNameUpdate(authUserId, quizid, name), req, res, next);
});

quizRouter.put('/:quizid(-?\\d+)/question/:questionid(-?\\d+)/move', (req: Request, res: Response, next: NextFunction) => {
  const quizid = parseInt(req.params.quizid);
  const questionid = parseInt(req.params.questionid);
  const { authUserId, newPosition } = req.body;
  tryCatch(() => adminQuizQuestionMove(authUserId, quizid, questionid, newPosition), req, res, next);
});

quizRouter.delete('/:quizid(-?\\d+)', (req: Request, res: Response, next: NextFunction) => {
  const quizid = parseInt(req.params.quizid);
  const { authUserId } = req.body;
  tryCatch(() => adminQuizRemove(authUserId, quizid), req, res, next);
});

quizRouter.put('/:quizid(-?\\d+)/description', (req: Request, res: Response, next: NextFunction) => {
  const quizid = parseInt(req.params.quizid);
  const { authUserId, description } = req.body;
  tryCatch(() => adminQuizDescriptionUpdate(authUserId, quizid, description), req, res, next);
});

quizRouter.post('/:quizId(-?\\d+)/question', (req: Request, res: Response, next: NextFunction) => {
  const { authUserId, questionBody } = req.body;
  const quizId = parseInt(req.params.quizId);
  tryCatch(() => adminQuizQuestionCreate(authUserId, quizId, questionBody), req, res, next);
});

quizRouter.get('/trash', (req: Request, res: Response, next: NextFunction) => {
  const { authUserId } = req.body;
  tryCatch(() => adminQuizTrashView(authUserId), req, res, next);
});

quizRouter.delete('/trash/empty', (req: Request, res: Response, next: NextFunction) => {
  const { authUserId } = req.body;
  const quizIds: number[] = JSON.parse(req.query.quizIds as string);
  tryCatch(() => adminQuizTrashEmpty(authUserId, quizIds), req, res, next);
});

quizRouter.post('/:quizId(-?\\d+)/restore', (req: Request, res: Response, next: NextFunction) => {
  const { authUserId } = req.body;
  const quizId = parseInt(req.params.quizId);
  tryCatch(() => adminQuizRestore(authUserId, quizId), req, res, next);
});

quizRouter.post('/:quizId(-?\\d+)/question/:questionId(-?\\d+)/duplicate', (req: Request, res: Response, next: NextFunction) => {
  const { authUserId } = req.body;
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  tryCatch(() => adminQuizQuestionDuplicate(authUserId, quizId, questionId), req, res, next);
});

quizRouter.delete('/:quizid(-?\\d+)/question/:questionid(-?\\d+)', (req: Request, res: Response, next: NextFunction) => {
  const quizid = parseInt(req.params.quizid);
  const questionid = parseInt(req.params.questionid);
  const { authUserId } = req.body;
  tryCatch(() => adminQuizQuestionDelete(authUserId, quizid, questionid), req, res, next);
});

quizRouter.post('/:quizid(-?\\d+)/transfer', (req: Request, res: Response, next: NextFunction) => {
  const quizid = parseInt(req.params.quizid);
  const { authUserId, userEmail } = req.body;
  tryCatch(() => adminQuizTransfer(authUserId, quizid, userEmail), req, res, next);
});

quizRouter.put('/:quizid(-?\\d+)/question/:questionid(-?\\d+)', (req: Request, res: Response, next: NextFunction) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { authUserId, questionBody } = req.body;
  tryCatch(() => adminQuizQuestionUpdate(authUserId, quizId, questionId, questionBody), req, res, next);
});
