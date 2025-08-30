import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwtService';
import { UserModel } from '../models/User';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        username: string;
        email: string;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token is required'
      });
      return;
    }

    // Verify the token
    const payload = await jwtService.verifyToken(token);
    
    // Extract user information
    req.user = {
      sub: payload.sub,
      username: payload.username,
      email: payload.email
    };

    next();
  } catch (error: any) {
    console.error('Token authentication failed:', error.message);
    
    res.status(401).json({
      success: false,
      error: error.message || 'Invalid token'
    });
  }
};

/**
 * Optional authentication middleware - continues even if no token is provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (token) {
      try {
        const payload = await jwtService.verifyToken(token);
        req.user = {
          sub: payload.sub,
          username: payload.username,
          email: payload.email
        };
      } catch (error) {
        // Token is invalid, but we continue without authentication
        console.log('Optional auth failed, continuing without user context');
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Middleware to check if user exists in database
 */
export const validateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const user = await UserModel.findById(req.user.sub);
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Update user information in request
    req.user = {
      sub: user._id!.toString(),
      username: user.username,
      email: user.email
    };

    next();
  } catch (error: any) {
    console.error('User validation failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'User validation failed'
    });
  }
};

/**
 * Extract bearer token from request headers
 */
export const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  return authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
};
