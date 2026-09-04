import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as eventsController from '../controllers/events.controller';

const router = Router();
router.use(authMiddleware);
router.get('/:symbol', eventsController.getEvents);

export default router;
