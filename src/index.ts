import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import services and middleware
import { database } from './utils/database';
import { keyService } from './services/keyService';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import jwksRoutes from './routes/jwksRoutes';
import tokenRoutes from './routes/tokenRoutes';

class App {
  public app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging in development
    if (process.env.NODE_ENV === 'development') {
      this.app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
      });
    }
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'JWT Generator API is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database_connected: database.isDbConnected()
      });
    });

    // API documentation endpoint
    this.app.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'JWT Generator API',
        version: '1.0.0',
        database_connected: database.isDbConnected(),
        endpoints: {
          demo_token: {
            generate: 'POST /api/token/generate',
            validate: 'POST /api/token/validate'
          },
          auth: database.isDbConnected() ? {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            profile: 'GET /api/auth/profile (requires auth)',
            refresh: 'POST /api/auth/refresh (requires auth)',
            validate: 'POST /api/auth/validate'
          } : {
            note: 'Database authentication endpoints unavailable (MongoDB not connected)'
          },
          jwks: {
            jwks: 'GET /api/jwks',
            'well-known': 'GET /api/.well-known/jwks.json',
            'public-key': 'GET /api/public-key',
            'key-info': 'GET /api/key-info'
          },
          utility: {
            health: 'GET /health'
          }
        },
        documentation: {
          demo_usage: {
            generate_token: 'curl -X POST http://localhost:3000/api/token/generate -H "Content-Type: application/json" -d \'{"username":"testuser","email":"test@example.com"}\'',
            validate_token: 'curl -X POST http://localhost:3000/api/token/validate -H "Content-Type: application/json" -d \'{"token":"YOUR_JWT_TOKEN"}\'',
            get_jwks: 'curl http://localhost:3000/api/jwks'
          },
          postman: 'Import the API endpoints into Postman for testing',
          curl_examples: {
            register: database.isDbConnected() ? 'curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d \'{"username":"test","email":"test@example.com","password":"password123"}\'' : 'Database required',
            login: database.isDbConnected() ? 'curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d \'{"username":"test","password":"password123"}\'' : 'Database required',
            jwks: 'curl http://localhost:3000/api/jwks',
            validate: 'curl -X POST http://localhost:3000/api/auth/validate -H "Authorization: Bearer YOUR_JWT_TOKEN"'
          }
        }
      });
    });

    // API routes
    this.app.use('/api/token', tokenRoutes); // Demo token routes (no DB required)
    this.app.use('/api/auth', authRoutes);   // Auth routes (requires DB)
    this.app.use('/api', jwksRoutes);        // JWKS routes (no DB required)

    // Token endpoint (OAuth2-style)
    this.app.use('/token', tokenRoutes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      console.log('🚀 Starting JWT Generator API...');
      
      // Initialize database connection (optional)
      console.log('📦 Connecting to database...');
      await database.connect();
      
      // Initialize cryptographic keys
      console.log('🔐 Initializing cryptographic keys...');
      await keyService.initializeKeys();
      
      // Start the server
      this.app.listen(this.port, () => {
        console.log('✅ JWT Generator API started successfully!');
        console.log(`🌍 Server running on port ${this.port}`);
        console.log(`📋 API Documentation: http://localhost:${this.port}/`);
        console.log(`🔑 JWKS Endpoint: http://localhost:${this.port}/api/jwks`);
        console.log(`🎯 Demo Token Generation: http://localhost:${this.port}/api/token/generate`);
        console.log(`🏥 Health Check: http://localhost:${this.port}/health`);
        console.log(`🛠️  Environment: ${process.env.NODE_ENV || 'development'}`);
        
        if (database.isDbConnected()) {
          console.log('💾 Database: Connected (full authentication available)');
        } else {
          console.log('⚠️  Database: Not connected (using demo token mode)');
        }
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Create and start the application
const app = new App();
app.start().catch((error) => {
  console.error('❌ Unhandled error during startup:', error);
  process.exit(1);
});

export default app;
