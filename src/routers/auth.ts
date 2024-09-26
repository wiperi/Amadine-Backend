import { Router, Request, Response } from 'express';
import { ERROR_MESSAGES } from '../errors';

import { adminAuthRegister } from '../auth';

export const authRouter = Router();

authRouter.get('/', (req: Request, res: Response) => {
  return res.json({
    message: 'Auth successful',
  });
});

authRouter.post('/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;

  if (!email || !password || !nameFirst || !nameLast) {
    return res.status(400).json({ error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS });
  }

  try {
    return res.status(200).json(adminAuthRegister(email, password, nameFirst, nameLast));
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});
