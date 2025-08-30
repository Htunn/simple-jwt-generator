import * as jose from 'jose';
import { keyService } from './keyService';
import { JWTPayload, TokenResponse } from '../types';

export class JWTService {
  private issuer: string;
  private audience: string;
  private expirationTime: string;

  constructor() {
    this.issuer = process.env.JWT_ISSUER || 'jwt-generator-app';
    this.audience = process.env.JWT_AUDIENCE || 'jwt-generator-api';
    this.expirationTime = process.env.JWT_EXPIRATION || '1h';
  }

  /**
   * Generate a JWT token for a user
   */
  async generateToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>): Promise<TokenResponse> {
    try {
      const privateKey = keyService.getPrivateKey();
      const keyId = keyService.getKeyId();

      // Create the JWT
      const jwt = await new jose.SignJWT({
        ...payload,
      })
        .setProtectedHeader({ 
          alg: 'RS256',
          typ: 'JWT',
          kid: keyId 
        })
        .setIssuedAt()
        .setIssuer(this.issuer)
        .setAudience(this.audience)
        .setExpirationTime(this.expirationTime)
        .sign(privateKey);

      // Calculate expires_in (in seconds)
      const expiresIn = this.calculateExpirationSeconds(this.expirationTime);

      return {
        access_token: jwt,
        token_type: 'Bearer',
        expires_in: expiresIn
      };
    } catch (error) {
      console.error('Failed to generate JWT:', error);
      throw new Error('Token generation failed');
    }
  }

  /**
   * Verify and decode a JWT token
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const publicKey = keyService.getPublicKey();

      const { payload } = await jose.jwtVerify(token, publicKey, {
        issuer: this.issuer,
        audience: this.audience,
      });

      // Convert jose JWT payload to our custom JWTPayload type
      return {
        sub: payload.sub || '',
        username: (payload as any).username || '',
        email: (payload as any).email || '',
        iat: payload.iat,
        exp: payload.exp,
        iss: payload.iss,
        aud: typeof payload.aud === 'string' ? payload.aud : (payload.aud?.[0] || '')
      };
    } catch (error) {
      console.error('JWT verification failed:', error);
      
      if (error instanceof jose.errors.JWTExpired) {
        throw new Error('Token has expired');
      } else if (error instanceof jose.errors.JWTInvalid) {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Decode JWT without verification (for inspection purposes)
   */
  decodeToken(token: string): { header: any; payload: any } {
    try {
      const header = jose.decodeProtectedHeader(token);
      const payload = jose.decodeJwt(token);

      return { header, payload };
    } catch (error) {
      throw new Error('Failed to decode token');
    }
  }

  /**
   * Check if a token is expired without full verification
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = jose.decodeJwt(token);
      
      if (!payload.exp) {
        return false; // No expiration set
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true; // If we can't decode it, consider it expired
    }
  }

  /**
   * Extract user information from token
   */
  async extractUserFromToken(token: string): Promise<{ sub: string; username: string; email: string }> {
    const payload = await this.verifyToken(token);
    return {
      sub: payload.sub,
      username: payload.username,
      email: payload.email
    };
  }

  /**
   * Convert expiration time string to seconds
   */
  private calculateExpirationSeconds(expiration: string): number {
    const timeValue = parseInt(expiration);
    const timeUnit = expiration.slice(-1).toLowerCase();

    switch (timeUnit) {
      case 's': return timeValue;
      case 'm': return timeValue * 60;
      case 'h': return timeValue * 60 * 60;
      case 'd': return timeValue * 24 * 60 * 60;
      default: return 3600; // Default to 1 hour
    }
  }
}

// Singleton instance
export const jwtService = new JWTService();
