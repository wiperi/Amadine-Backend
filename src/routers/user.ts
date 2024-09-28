import { Router, Request, Response } from 'express';
import { adminUserPasswordUpdate } from '../auth';
export const userRouter = Router();

userRouter.get('/', (req: Request, res: Response) => {
  return res.status(200).json({ message: 'User route' });
});

userRouter.put('/password', (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const authUserId = req.body.authUserId;
  try {
    return res.json(adminUserPasswordUpdate(authUserId, oldPassword, newPassword));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});
