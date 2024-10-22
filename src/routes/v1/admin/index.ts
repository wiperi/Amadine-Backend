import { Router } from 'express';
import authRouter from './auth';
import userRouter from './user';
import quizRouter from './quiz';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/quiz', quizRouter);

export default router;
