import { Request, Response } from 'express';
import { keyService } from '../services/keyService';
import { asyncHandler } from '../middleware/errorHandler';
import { JWKS } from '../types';

export const getJWKS = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const jwks: JWKS = await keyService.getJWKS();
    
    // Set appropriate caching headers
    res.set({
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'Content-Type': 'application/json'
    });

    res.status(200).json(jwks);
  } catch (error) {
    console.error('Failed to generate JWKS:', error);
    res.status(500).json({
      error: 'Failed to retrieve JWKS'
    });
  }
});

export const getWellKnownJWKS = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const jwks: JWKS = await keyService.getJWKS();
    
    // Set appropriate caching headers for .well-known endpoint
    res.set({
      'Cache-Control': 'public, max-age=86400',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    res.status(200).json(jwks);
  } catch (error) {
    console.error('Failed to generate JWKS for .well-known:', error);
    res.status(500).json({
      error: 'Failed to retrieve JWKS'
    });
  }
});

export const getPublicKey = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const publicKey = keyService.getPublicKey();
    const keyId = keyService.getKeyId();
    
    // Export public key in PEM format
    const jose = await import('jose');
    const publicKeyPem = await jose.exportSPKI(publicKey);
    
    res.set({
      'Cache-Control': 'public, max-age=86400',
      'Content-Type': 'application/x-pem-file'
    });

    res.status(200).send(publicKeyPem);
  } catch (error) {
    console.error('Failed to retrieve public key:', error);
    res.status(500).json({
      error: 'Failed to retrieve public key'
    });
  }
});

export const getKeyInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const keyId = keyService.getKeyId();
    const publicKey = keyService.getPublicKey();
    
    // Get key metadata
    const jose = await import('jose');
    const jwk = await jose.exportJWK(publicKey);
    
    const keyInfo = {
      kid: keyId,
      kty: jwk.kty,
      alg: 'RS256',
      use: 'sig',
      key_ops: ['verify'],
      created_at: new Date().toISOString(),
      status: 'active'
    };

    res.status(200).json({
      success: true,
      data: keyInfo,
      message: 'Key information retrieved successfully'
    });
  } catch (error) {
    console.error('Failed to get key info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve key information'
    });
  }
});
