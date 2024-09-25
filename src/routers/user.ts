import { Router, Request, Response } from 'express';

export const userRouter = Router();

userRouter.get('/', (req: Request, res: Response) => {
  return res.json({
    message: 'User successful',
  });
});
