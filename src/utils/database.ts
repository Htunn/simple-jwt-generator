import mongoose from 'mongoose';

export class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    // Check if we should skip database connection
    if (process.env.SKIP_DATABASE === 'true') {
      console.log('⚠️  Database connection skipped (SKIP_DATABASE=true)');
      this.isConnected = false;
      return;
    }

    if (this.isConnected) {
      console.log('Database is already connected');
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jwt-generator';
      
      await mongoose.connect(mongoUri);
      
      this.isConnected = true;
      console.log('Connected to MongoDB successfully');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.isConnected = false;
      });

      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('⚠️  Failed to connect to MongoDB:', error);
      console.log('🔄 Continuing without database (authentication endpoints will be limited)');
      this.isConnected = false;
      // Don't throw error, allow app to continue for JWT testing
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public isDbConnected(): boolean {
    return this.isConnected;
  }
}

export const database = Database.getInstance();
