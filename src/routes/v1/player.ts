import { Router, Request, Response, NextFunction } from 'express';
import { PlayerJoinSession } from '@/services/player';
import { tryCatch } from '@/utils/helper';

const router = Router();

router.post('/join', (req: Request, res: Response, next: NextFunction) => {
  const { sessionId, name } = req.body;
  tryCatch(() => PlayerJoinSession(sessionId, name), req, res, next);
});

export default router;
