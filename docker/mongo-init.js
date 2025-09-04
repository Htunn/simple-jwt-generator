// MongoDB initialization script for Docker
// This script runs when the MongoDB container is first created

// Switch to the jwt-generator database
db = db.getSiblingDB('jwt-generator');

// Create a user for the application (optional - for basic auth setup)
// Note: In production, you should use proper authentication
/*
db.createUser({
  user: 'jwt-app',
  pwd: 'jwt-app-password',
  roles: [
    {
      role: 'readWrite',
      db: 'jwt-generator'
    }
  ]
});
*/

// Create indexes for better performance
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

// Insert sample data (optional - for testing)
// Uncomment the following lines if you want sample data
/*
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3pxOwgEOJ2", // password: admin123
  createdAt: new Date(),
  updatedAt: new Date()
});
*/

print('✅ JWT Generator database initialized successfully');
