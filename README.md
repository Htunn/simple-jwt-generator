# Simple JWT Generator

A comprehensive JWT (JSON Web Token) generator application built with TypeScript, Express.js, and MongoDB. This application provides JWT token generation, validation, and JWKS (JSON Web Key Set) endpoint for public key distribution.

## Features

- **JWT Token Generation**: Create signed JWT tokens with custom payloads
- **JWKS Endpoint**: Provide public keys for JWT verification via standard JWKS endpoint
- **Token Validation**: Verify JWT tokens with comprehensive error handling
- **User Authentication**: Complete user registration and login system
- **RSA Key Management**: Automatic RSA key pair generation and management
- **MongoDB Integration**: User data persistence with MongoDB
- **TypeScript**: Full TypeScript support with proper type definitions
- **Security**: Built-in security middleware with Helmet and CORS
- **Comprehensive API**: RESTful API with proper error handling

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd simple-jwt-generator
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB (if running locally):
```bash
# macOS with Homebrew
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services management console
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication Endpoints

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

#### Get User Profile
```bash
GET /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Refresh Token
```bash
POST /api/auth/refresh
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Validate Token
```bash
POST /api/auth/validate
Authorization: Bearer YOUR_JWT_TOKEN

# Or in request body:
{
  "token": "YOUR_JWT_TOKEN"
}
```

### JWKS Endpoints

#### Get JWKS (JSON Web Key Set)
```bash
GET /api/jwks
GET /api/jwks.json
GET /api/.well-known/jwks.json
```

#### Get Public Key (PEM format)
```bash
GET /api/public-key
GET /api/public-key.pem
```

#### Get Key Information
```bash
GET /api/key-info
```

### Utility Endpoints

#### Health Check
```bash
GET /health
```

#### API Documentation
```bash
GET /
```

## Usage Examples

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johnsmith",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "username": "johnsmith",
      "email": "john@example.com",
      "_id": "64f8b123456789abcdef1234"
    },
    "token": {
      "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQta2V5LWlkIn0...",
      "token_type": "Bearer",
      "expires_in": 3600
    }
  },
  "message": "User registered successfully"
}
```

### 2. Login and Get Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johnsmith",
    "password": "securepassword123"
  }'
```

### 3. Access Protected Resources

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQta2V5LWlkIn0..."
```

### 4. Get JWKS for Token Verification

```bash
curl http://localhost:3000/api/jwks
```

Response:
```json
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "key_ops": ["verify"],
      "alg": "RS256",
      "kid": "default-key-id",
      "n": "base64url-encoded-modulus",
      "e": "AQAB"
    }
  ]
}
```

### 5. Validate a JWT Token

```bash
# Using Authorization header
curl -X POST http://localhost:3000/api/auth/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Or using request body
curl -X POST http://localhost:3000/api/auth/validate \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_JWT_TOKEN"}'
```

## JWT Token Verification (Client-Side)

You can verify JWT tokens issued by this service using the JWKS endpoint:

### Node.js Example with jose library

```javascript
import * as jose from 'jose';

async function verifyToken(token) {
  try {
    const JWKS_URL = 'http://localhost:3000/api/jwks'\;
    const jwks = jose.createRemoteJWKSet(new URL(JWKS_URL));
    
    const { payload, protectedHeader } = await jose.jwtVerify(token, jwks, {
      issuer: 'jwt-generator-app',
      audience: 'jwt-generator-api',
    });
    
    console.log('Token is valid!', payload);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw error;
  }
}

// Usage
const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQta2V5LWlkIn0...';
verifyToken(token);
```

### Python Example with PyJWT

```python
import jwt
import requests
from cryptography.hazmat.primitives import serialization

def verify_token(token):
    # Get JWKS
    jwks_response = requests.get('http://localhost:3000/api/jwks')
    jwks = jwks_response.json()
    
    # Extract public key (this is a simplified example)
    # In production, you'd want to handle key rotation and caching
    
    try:
        payload = jwt.decode(
            token,
            # You'll need to construct the public key from the JWKS
            audience='jwt-generator-api',
            issuer='jwt-generator-app',
            algorithms=['RS256']
        )
        print('Token is valid!', payload)
        return payload
    except jwt.InvalidTokenError as e:
        print('Token verification failed:', str(e))
        raise
```

## Configuration

The application can be configured using environment variables:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/jwt-generator

# JWT Configuration
JWT_ISSUER=jwt-generator-app
JWT_AUDIENCE=jwt-generator-api
JWT_EXPIRATION=1h

# Security
BCRYPT_ROUNDS=12

# Keys Directory
KEYS_DIR=./keys
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm start` - Start production server
- `npm run test` - Run tests (placeholder)

### Project Structure

```
src/
├── controllers/       # Request handlers
├── middleware/        # Express middleware
├── models/           # Database models
├── routes/           # Route definitions
├── services/         # Business logic services
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── index.ts          # Application entry point
```

## Security Considerations

- Tokens are signed using RSA-256 algorithm
- Passwords are hashed using bcrypt with configurable rounds
- CORS and Helmet middleware for security headers
- Input validation on all endpoints
- Error handling without information leakage
- Secure key storage and management

## Testing

You can test the API using various tools:

### Using curl

See the examples above for curl commands.

### Using Postman

1. Import the API endpoints into Postman
2. Create a new environment with `baseUrl = http://localhost:3000`
3. Test the endpoints following the documentation

### Using JWT.io

1. Copy a JWT token from the API response
2. Go to [jwt.io](https://jwt.io)
3. Paste the token to decode and inspect the payload
4. Get the public key from `/api/public-key` to verify the signature

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the `MONGODB_URI` in your `.env` file
   - Verify MongoDB is accessible

2. **Key Generation Errors**
   - Ensure the `keys` directory is writable
   - Check file permissions

3. **Token Verification Fails**
   - Ensure you're using the correct issuer and audience
   - Check that the token hasn't expired
   - Verify the token format is correct

4. **CORS Issues**
   - Configure `ALLOWED_ORIGINS` in your `.env` file
   - Check browser developer tools for CORS errors

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a proper process manager (PM2, Docker, etc.)
3. Configure MongoDB for production
4. Set up proper logging and monitoring
5. Use environment variables for all configuration
6. Implement proper backup strategies for keys and database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Security Notes for Public Repository

⚠️ **Important Security Considerations:**

### Excluded Files
This repository's `.gitignore` excludes the following sensitive files:
- `.env` - Environment variables and configuration
- `keys/` - RSA private and public key files
- `node_modules/` - Dependencies
- Build artifacts and logs

### Before Deployment
1. **Environment Variables**: Copy `.env.example` to `.env` and configure with your settings
2. **Key Generation**: Keys will be automatically generated on first startup
3. **Database**: Configure MongoDB URI if using database features
4. **Security**: Change default JWT issuer and audience for production

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique JWT issuer and audience values
- [ ] Configure proper MongoDB connection with authentication
- [ ] Set up proper logging and monitoring
- [ ] Use HTTPS in production
- [ ] Configure CORS for your specific domains
- [ ] Implement rate limiting
- [ ] Set up key rotation strategy
- [ ] Use environment variables for all sensitive data

### Demo vs Production
- **Demo Mode**: Set `SKIP_DATABASE=true` for testing without MongoDB
- **Production Mode**: Set `SKIP_DATABASE=false` and configure MongoDB

### Key Management
- Private keys are automatically generated and stored in `keys/` directory
- Keys are excluded from git to prevent accidental exposure
- In production, consider using external key management services
- Implement key rotation for enhanced security

