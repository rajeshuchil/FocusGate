import express, { Router } from 'express';
import { getTask,createTask,taskCompleted } from '../controllers/taskController.js';

const router = express.Router();

router.get('/tasks',getTask);
router.post('/tasks',createTask);;
router.patch('/tasks/:id',taskCompleted);

export default router;