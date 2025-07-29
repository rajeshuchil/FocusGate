import express from 'express';
import { generateToken, validateToken, markTokenAsUsed } from '../controllers/tokenController.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', verifyUser, generateToken);
router.get('/validate/:tokenId', validateToken); // No auth needed
router.post('/use/:tokenId', markTokenAsUsed); // Mark as used, no auth

export default router;
