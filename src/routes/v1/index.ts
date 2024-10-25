import { Router } from 'express';
import adminRouter from './admin';
import playerRouter from './player';
import { clear } from '@/utils/other';
import { Request, Response } from 'express';

const router = Router();

router.use('/admin', adminRouter);
router.use('/player', playerRouter);

router.delete('/clear', (req: Request, res: Response) => {
  return res.status(200).json(clear());
});

export default router;
