import * as jose from 'jose';
import * as fs from 'fs/promises';
import * as path from 'path';
import { JWKS, JWKSKey } from '../types';

export class KeyService {
  private privateKey: any = null;
  private publicKey: any = null;
  private keyId: string = 'default-key-id';
  private keysDir: string;

  constructor() {
    this.keysDir = process.env.KEYS_DIR || './keys';
  }

  /**
   * Initialize keys - load existing or generate new ones
   */
  async initializeKeys(): Promise<void> {
    try {
      await this.ensureKeysDirectory();
      
      const privateKeyExists = await this.fileExists(this.getPrivateKeyPath());
      const publicKeyExists = await this.fileExists(this.getPublicKeyPath());

      if (privateKeyExists && publicKeyExists) {
        console.log('Loading existing RSA keys...');
        await this.loadKeys();
      } else {
        console.log('Generating new RSA key pair...');
        await this.generateKeyPair();
      }
    } catch (error) {
      console.error('Failed to initialize keys:', error);
      throw error;
    }
  }

  /**
   * Generate new RSA key pair with extractable keys
   */
  private async generateKeyPair(): Promise<void> {
    const { publicKey, privateKey } = await jose.generateKeyPair('RS256', {
      modulusLength: 2048,
      extractable: true, // Make keys extractable
    });

    this.privateKey = privateKey;
    this.publicKey = publicKey;

    try {
      // Export keys to PEM format for storage
      const privateKeyPem = await jose.exportPKCS8(privateKey);
      const publicKeyPem = await jose.exportSPKI(publicKey);

      // Save keys to files
      await fs.writeFile(this.getPrivateKeyPath(), privateKeyPem);
      await fs.writeFile(this.getPublicKeyPath(), publicKeyPem);

      console.log('RSA key pair generated and saved successfully');
    } catch (exportError) {
      console.warn('Failed to export keys to files:', exportError);
      console.log('Continuing with in-memory keys only');
    }
  }

  /**
   * Load existing keys from files
   */
  private async loadKeys(): Promise<void> {
    try {
      const privateKeyPem = await fs.readFile(this.getPrivateKeyPath(), 'utf8');
      const publicKeyPem = await fs.readFile(this.getPublicKeyPath(), 'utf8');

      this.privateKey = await jose.importPKCS8(privateKeyPem, 'RS256');
      this.publicKey = await jose.importSPKI(publicKeyPem, 'RS256');

      console.log('RSA keys loaded successfully');
    } catch (error) {
      console.error('Failed to load keys:', error);
      throw error;
    }
  }

  /**
   * Get private key for signing
   */
  getPrivateKey(): any {
    if (!this.privateKey) {
      throw new Error('Private key not initialized');
    }
    return this.privateKey;
  }

  /**
   * Get public key for verification
   */
  getPublicKey(): any {
    if (!this.publicKey) {
      throw new Error('Public key not initialized');
    }
    return this.publicKey;
  }

  /**
   * Get key ID
   */
  getKeyId(): string {
    return this.keyId;
  }

  /**
   * Generate JWKS (JSON Web Key Set) for public key distribution
   */
  async getJWKS(): Promise<JWKS> {
    if (!this.publicKey) {
      throw new Error('Public key not initialized');
    }

    try {
      // Export public key as JWK
      const jwk = await jose.exportJWK(this.publicKey);

      const jwksKey: JWKSKey = {
        kty: jwk.kty || 'RSA',
        use: 'sig',
        key_ops: ['verify'],
        alg: 'RS256',
        kid: this.keyId,
        n: jwk.n || '',
        e: jwk.e || ''
      };

      return {
        keys: [jwksKey]
      };
    } catch (error) {
      console.error('Failed to generate JWKS:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private async ensureKeysDirectory(): Promise<void> {
    try {
      await fs.access(this.keysDir);
    } catch {
      await fs.mkdir(this.keysDir, { recursive: true });
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private getPrivateKeyPath(): string {
    return path.join(this.keysDir, 'private-key.pem');
  }

  private getPublicKeyPath(): string {
    return path.join(this.keysDir, 'public-key.pem');
  }
}

// Singleton instance
export const keyService = new KeyService();
