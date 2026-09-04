import { Router } from 'express';
import * as feedController from '../controllers/feed.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);
router.get('/since-last-visit', feedController.getSinceLastVisit);

export default router;
