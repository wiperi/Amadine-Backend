import { Router } from 'express';
import adminRouter from './admin';
import playerRouter from './player';

const router = Router();

router.use('/admin', adminRouter);
router.use('/player', playerRouter);

export default router;
