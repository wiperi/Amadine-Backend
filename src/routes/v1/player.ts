import { Router, Request, Response, NextFunction } from 'express';
import { PlayerJoinSession, PlayerGetQuestionInfo } from '@/services/player';
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
    tryCatch(() => PlayerGetQuestionInfo(playerId, questionposition), req, res, next);
  }
);
export default router;
