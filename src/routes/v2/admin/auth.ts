import { Router, Request, Response, NextFunction } from 'express';
import { adminAuthLogin, adminAuthRegister, adminAuthLogout } from '@/services/auth';
import { tryCatch } from '@/utils/helper';

const router = Router();

router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.token as string;
  tryCatch(() => adminAuthLogout(token), req, res, next);
});

export default router;
