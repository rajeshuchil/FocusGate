import express from 'express';
import { getTokens,issueToken,useToken } from '../controllers/tokenController.js';

const router = express.Router();

router.get('/token',getTokens);
router.post('/token',issueToken);
router.patch('/token/:id',useToken);

export default router;