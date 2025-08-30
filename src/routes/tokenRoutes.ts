import { Router } from 'express';
import { generateDemoToken, validateDemoToken } from '../controllers/tokenController';

const router = Router();

// Demo token generation (works without database)
router.post('/generate', generateDemoToken);
router.post('/validate', validateDemoToken);

export default router;
