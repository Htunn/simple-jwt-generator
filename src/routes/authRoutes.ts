import { Router } from 'express';
import { register, login, getProfile, refreshToken, validateToken } from '../controllers/authController';
import { authenticateToken, validateUser } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/validate', validateToken);

// Protected routes
router.get('/profile', authenticateToken, validateUser, getProfile);
router.post('/refresh', authenticateToken, validateUser, refreshToken);

export default router;
