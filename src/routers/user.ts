import { Router, Request, Response, NextFunction } from 'express';
import { adminUserPasswordUpdate, adminUserDetailsUpdate, adminUserDetails } from '@/services/auth';
import { tryCatch } from '@/utils/helper';

export const userRouter = Router();

userRouter.put('/password', (req: Request, res: Response, next: NextFunction) => {
  const { oldPassword, newPassword } = req.body;
  const authUserId = req.body.authUserId;
  tryCatch(() => adminUserPasswordUpdate(authUserId, oldPassword, newPassword), req, res, next);
});

userRouter.put('/details', (req: Request, res: Response, next: NextFunction) => {
  const { email, nameFirst, nameLast } = req.body;
  const authUserId = req.body.authUserId;
  tryCatch(() => adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast), req, res, next);
});

userRouter.get('/details', (req: Request, res: Response, next: NextFunction) => {
  const { authUserId } = req.body;
  tryCatch(() => adminUserDetails(authUserId), req, res, next);
});
