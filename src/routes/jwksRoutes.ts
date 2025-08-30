import { Router } from 'express';
import { getJWKS, getWellKnownJWKS, getPublicKey, getKeyInfo } from '../controllers/jwksController';

const router = Router();

// JWKS endpoints
router.get('/jwks', getJWKS);
router.get('/jwks.json', getJWKS);
router.get('/.well-known/jwks.json', getWellKnownJWKS);

// Public key endpoints
router.get('/public-key', getPublicKey);
router.get('/public-key.pem', getPublicKey);
router.get('/key-info', getKeyInfo);

export default router;
