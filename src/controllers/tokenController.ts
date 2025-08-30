import { Request, Response } from 'express';
import { jwtService } from '../services/jwtService';
import { asyncHandler } from '../middleware/errorHandler';
import { TokenResponse, ApiResponse } from '../types';

export const generateDemoToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { username = 'demo-user', email = 'demo@example.com' } = req.body;

  try {
    // Generate a demo token without requiring database
    const tokenResponse = await jwtService.generateToken({
      sub: 'demo-user-id',
      username: username,
      email: email
    });

    const response: ApiResponse<TokenResponse> = {
      success: true,
      data: tokenResponse,
      message: 'Demo JWT token generated successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate demo token'
    });
  }
});

export const validateDemoToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const token = req.body.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(400).json({
      success: false,
      error: 'Token is required'
    });
    return;
  }

  try {
    const payload = await jwtService.verifyToken(token);
    const decoded = jwtService.decodeToken(token);

    const response: ApiResponse<{ valid: boolean; payload: any; decoded: any }> = {
      success: true,
      data: {
        valid: true,
        payload,
        decoded
      },
      message: 'Token is valid'
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<{ valid: boolean; error: string }> = {
      success: false,
      data: {
        valid: false,
        error: error.message
      },
      error: 'Token validation failed'
    };

    res.status(401).json(response);
  }
});
