import { Router, Request, Response } from 'express';
import { adminAuthLogin, adminAuthRegister } from '../auth';

export const authRouter = Router();

authRouter.post('/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  try {
    return res.json(adminAuthRegister(email, password, nameFirst, nameLast));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    return res.json(adminAuthLogin(email, password));
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});