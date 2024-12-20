import { Router, Request, Response, NextFunction } from 'express';
import {
  PlayerJoinSession,
  playerGetQuestionInfo,
  playerPostMessage,
  adminPlayerSubmitAnswers,
  playerGetMessage,
  playerGetSessionStatus,
  playerGetQuestionResult,
  playerGetSessionResult,
} from '@/services/player';
import { tryCatch } from '@/utils/helper';

const router = Router();

router.post('/join', (req: Request, res: Response, next: NextFunction) => {
  const { sessionId, name } = req.body;
  tryCatch(() => PlayerJoinSession(sessionId, name), req, res, next);
});

router.get(
  '/:playerid(-?\\d+)/question/:questionposition(-?\\d+)',
  (req: Request, res: Response, next: NextFunction) => {
    const playerId = parseInt(req.params.playerid);
    const questionposition = parseInt(req.params.questionposition);
    tryCatch(() => playerGetQuestionInfo(playerId, questionposition), req, res, next);
  }
);

router.put(
  '/:playerid(-?\\d+)/question/:questionposition(-?\\d+)/answer',
  (req: Request, res: Response, next: NextFunction) => {
    const playerId = parseInt(req.params.playerid);
    const questionposition = parseInt(req.params.questionposition);
    const { answerIds } = req.body;
    tryCatch(() => adminPlayerSubmitAnswers(playerId, questionposition, answerIds), req, res, next);
  }
);

router.post('/:playerid(-?\\d+)/chat', (req: Request, res: Response, next: NextFunction) => {
  const playerId = parseInt(req.params.playerid);
  const message = req.body.message;
  tryCatch(() => playerPostMessage(playerId, message), req, res, next);
});

router.get('/:playerid(-?\\d+)/chat', (req: Request, res: Response, next: NextFunction) => {
  const playerId = parseInt(req.params.playerid);
  tryCatch(() => playerGetMessage(playerId), req, res, next);
});

router.get('/:playerid(-?\\d+)', (req: Request, res: Response, next: NextFunction) => {
  const playerId = parseInt(req.params.playerid);
  tryCatch(() => playerGetSessionStatus(playerId), req, res, next);
});

router.get(
  '/:playerid(-?\\d+)/question/:questionposition(-?\\d+)/results',
  (req: Request, res: Response, next: NextFunction) => {
    const playerId = parseInt(req.params.playerid);
    const questionposition = parseInt(req.params.questionposition);
    tryCatch(() => playerGetQuestionResult(playerId, questionposition), req, res, next);
  }
);

router.get('/:playerid(-?\\d+)/results', (req: Request, res: Response, next: NextFunction) => {
  const playerId = parseInt(req.params.playerid);
  tryCatch(() => playerGetSessionResult(playerId), req, res, next);
});

export default router;
