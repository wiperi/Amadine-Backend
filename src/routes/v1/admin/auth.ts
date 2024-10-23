import { Router, Request, Response, NextFunction } from 'express';
import { adminAuthLogin, adminAuthRegister, adminAuthLogout } from '@/services/v1/auth';
import { tryCatch } from '@/utils/helper';

const router = Router();

router.post('/register', (req: Request, res: Response, next: NextFunction) => {
  const { email, password, nameFirst, nameLast } = req.body;
  tryCatch(() => adminAuthRegister(email, password, nameFirst, nameLast), req, res, next);
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  tryCatch(() => adminAuthLogin(email, password), req, res, next);
});

router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.body;
  tryCatch(() => adminAuthLogout(token), req, res, next);
});

export default router;
