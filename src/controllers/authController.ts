import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { jwtService } from '../services/jwtService';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { UserLoginRequest, UserRegisterRequest, ApiResponse, TokenResponse } from '../types';

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { username, email, password }: UserRegisterRequest = req.body;

  // Validation
  if (!username || !email || !password) {
    throw new AppError('Username, email, and password are required', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  // Check if user already exists
  const existingUser = await UserModel.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    throw new AppError('User with this username or email already exists', 409);
  }

  // Create user
  const user = new UserModel({ username, email, password });
  await user.save();

  // Generate JWT token
  const tokenResponse = await jwtService.generateToken({
    sub: user._id!.toString(),
    username: user.username,
    email: user.email
  });

  const response: ApiResponse<{ user: any; token: TokenResponse }> = {
    success: true,
    data: {
      user: user.toJSON(),
      token: tokenResponse
    },
    message: 'User registered successfully'
  };

  res.status(201).json(response);
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { username, password }: UserLoginRequest = req.body;

  // Validation
  if (!username || !password) {
    throw new AppError('Username and password are required', 400);
  }

  // Find user by username or email
  const user = await UserModel.findOne({
    $or: [{ username }, { email: username }]
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate JWT token
  const tokenResponse = await jwtService.generateToken({
    sub: user._id!.toString(),
    username: user.username,
    email: user.email
  });

  const response: ApiResponse<{ user: any; token: TokenResponse }> = {
    success: true,
    data: {
      user: user.toJSON(),
      token: tokenResponse
    },
    message: 'Login successful'
  };

  res.status(200).json(response);
});

export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const user = await UserModel.findById(req.user.sub);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const response: ApiResponse<any> = {
    success: true,
    data: user.toJSON(),
    message: 'Profile retrieved successfully'
  };

  res.status(200).json(response);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const user = await UserModel.findById(req.user.sub);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Generate new JWT token
  const tokenResponse = await jwtService.generateToken({
    sub: user._id!.toString(),
    username: user.username,
    email: user.email
  });

  const response: ApiResponse<TokenResponse> = {
    success: true,
    data: tokenResponse,
    message: 'Token refreshed successfully'
  };

  res.status(200).json(response);
});

export const validateToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const token = req.body.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new AppError('Token is required', 400);
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
