export interface User {
  _id?: string;
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserRegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface JWTPayload {
  sub: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface JWKSKey {
  kty: string;
  use: string;
  key_ops: string[];
  alg: string;
  kid: string;
  n: string;
  e: string;
}

export interface JWKS {
  keys: JWKSKey[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
