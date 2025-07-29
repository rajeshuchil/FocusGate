import express from 'express';
import { getTask,createTask } from '../controllers/taskController.js';
import { verifyUser } from '../middleware/authMiddleware.js';
import { checkAndGenerateTokens } from '../controllers/checkAndGenerateTokens.js';

const router = express.Router();

router.use(verifyUser);

router.get('/',getTask);
router.post('/',createTask);
router.post('/check-completed',checkAndGenerateTokens);

export default router;

