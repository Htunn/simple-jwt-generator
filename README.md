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


## Architecture & Sequence Diagrams

### JWT Token Generation Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as JWT Generator API
    participant KeyService
    participant Database as MongoDB (Optional)
    
    Client->>API: POST /api/token/generate
    Note over Client,API: Demo mode (no auth required)
    
    API->>KeyService: getPrivateKey()
    KeyService-->>API: RSA Private Key
    
    API->>API: Create JWT payload<br/>{sub, username, email}
    API->>API: Sign JWT with RS256
    
    API-->>Client: JWT Token Response<br/>{access_token, expires_in}
    
    Note over Client: Token ready for use
```

### User Registration & Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as JWT Generator API
    participant Database as MongoDB
    participant KeyService
    
    Client->>API: POST /api/auth/register
    Note over Client,API: {username, email, password}
    
    API->>Database: Check if user exists
    Database-->>API: User not found
    
    API->>API: Hash password with bcrypt
    API->>Database: Create new user
    Database-->>API: User created successfully
    
    API->>KeyService: getPrivateKey()
    KeyService-->>API: RSA Private Key
    
    API->>API: Generate JWT token
    API-->>Client: Registration success<br/>{user, token}
    
    Note over Client: User registered & authenticated
```

### JWT Token Validation Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as JWT Generator API
    participant KeyService
    participant JWKS as JWKS Endpoint
    
    Note over Client: Has JWT token to validate
    
    Client->>API: POST /api/token/validate
    Note over Client,API: {token: "eyJ..."}
    
    API->>KeyService: getPublicKey()
    KeyService-->>API: RSA Public Key
    
    API->>API: Verify JWT signature<br/>Check issuer/audience<br/>Validate expiration
    
    alt Token Valid
        API-->>Client: Validation Success<br/>{valid: true, payload}
    else Token Invalid
        API-->>Client: Validation Failed<br/>{valid: false, error}
    end
    
    Note over Client: Token validation complete
```

### JWKS Public Key Distribution

```mermaid
sequenceDiagram
    participant Client as External Service
    participant JWKS as JWKS Endpoint
    participant KeyService
    participant Cache as Client Cache
    
    Note over Client: Needs public key for JWT verification
    
    Client->>JWKS: GET /api/jwks
    JWKS->>KeyService: getJWKS()
    
    KeyService->>KeyService: Export public key as JWK
    KeyService-->>JWKS: JWKS Response
    
    JWKS-->>Client: JSON Web Key Set<br/>{keys: [{kty, n, e, ...}]}
    
    Client->>Cache: Cache JWKS (24h TTL)
    Client->>Client: Use public key to verify JWT
    
    Note over Client: JWT verified independently
```

### End-to-End Authentication Workflow

```mermaid
sequenceDiagram
    participant User as User/Browser
    participant Client as Client App
    participant API as JWT Generator API
    participant Database as MongoDB
    participant Service as Protected Service
    
    User->>Client: Login request
    Client->>API: POST /api/auth/login<br/>{username, password}
    
    API->>Database: Validate credentials
    Database-->>API: User verified
    
    API->>API: Generate JWT token
    API-->>Client: Login success<br/>{user, token}
    
    Client->>Client: Store JWT token
    Client-->>User: Login successful
    
    Note over User,Service: User accesses protected resource
    
    User->>Client: Request protected data
    Client->>Service: API call with<br/>Authorization: Bearer JWT
    
    Service->>API: GET /api/jwks<br/>(Get public key)
    API-->>Service: JWKS response
    
    Service->>Service: Verify JWT signature<br/>using public key
    
    alt JWT Valid
        Service-->>Client: Protected data
        Client-->>User: Display data
    else JWT Invalid
        Service-->>Client: 401 Unauthorized
        Client-->>User: Please login again
    end
```

### Docker Deployment Architecture

```mermaid
graph TB
    subgraph "Docker Environment"
        LB[Load Balancer<br/>nginx:alpine]
        
        subgraph "Application Tier"
            API1[JWT Generator API<br/>Instance 1]
            API2[JWT Generator API<br/>Instance 2]
        end
        
        subgraph "Data Tier"
            DB[(MongoDB<br/>Replica Set)]
            Keys[Shared Volume<br/>RSA Keys]
        end
    end
    
    Internet((Internet)) --> LB
    LB --> API1
    LB --> API2
    
    API1 --> DB
    API2 --> DB
    API1 --> Keys
    API2 --> Keys
    
    subgraph "Client Applications"
        WebApp[Web Application]
        Mobile[Mobile App]
        Service[Microservice]
    end
    
    WebApp --> Internet
    Mobile --> Internet
    Service --> Internet
    
    style API1 fill:#e1f5fe
    style API2 fill:#e1f5fe
    style DB fill:#f3e5f5
    style Keys fill:#fff3e0
```

### Key Management & Security Flow

```mermaid
sequenceDiagram
    participant Admin
    participant API as JWT Generator API
    participant KeyService
    participant FileSystem
    participant Database as MongoDB
    
    Note over API: Application Startup
    
    API->>KeyService: initializeKeys()
    KeyService->>FileSystem: Check for existing keys
    
    alt Keys Exist
        KeyService->>FileSystem: Load private-key.pem
        KeyService->>FileSystem: Load public-key.pem
        KeyService-->>API: Keys loaded
    else No Keys Found
        KeyService->>KeyService: Generate RSA key pair
        KeyService->>FileSystem: Save private-key.pem
        KeyService->>FileSystem: Save public-key.pem
        KeyService-->>API: New keys generated
    end
    
    Note over API: API Ready for JWT operations
    
    Admin->>API: GET /api/key-info
    API->>KeyService: getKeyId(), getPublicKey()
    KeyService-->>API: Key metadata
    API-->>Admin: Key information<br/>{kid, alg, status}
    
    Note over Admin,Database: Key rotation (future enhancement)
```

### CI/CD Pipeline Flow

```mermaid
graph LR
    subgraph "Development"
        Dev[Developer]
        Local[Local Development]
    end
    
    subgraph "GitHub"
        Repo[GitHub Repository]
        Actions[GitHub Actions]
    end
    
    subgraph "CI/CD Pipeline"
        Build[Build & Test]
        Security[Security Scan]
        Deploy[Deploy to Registry]
    end
    
    subgraph "Production"
        Registry[Docker Registry]
        Prod[Production Environment]
    end
    
    Dev --> Local
    Local --> Repo
    Repo --> Actions
    Actions --> Build
    Build --> Security
    Security --> Deploy
    Deploy --> Registry
    Registry --> Prod
    
    Build --> |Tests Pass| Security
    Security --> |Secure| Deploy
    Deploy --> |Success| Prod
    
    style Build fill:#e8f5e8
    style Security fill:#fff3cd
    style Deploy fill:#d4edda
    style Prod fill:#d1ecf1
```

### Component Architecture Overview

```mermaid
graph TD
    subgraph "API Layer"
        Router[Express Router]
        Auth[Auth Controller]
        JWKS[JWKS Controller]
        Token[Token Controller]
    end
    
    subgraph "Middleware Layer"
        CORS[CORS Middleware]
        Helmet[Security Headers]
        AuthMW[Authentication MW]
        ErrorMW[Error Handler]
    end
    
    subgraph "Service Layer"
        JWTSvc[JWT Service]
        KeySvc[Key Service]
        DBUtil[Database Utility]
    end
    
    subgraph "Data Layer"
        MongoDB[(MongoDB)]
        KeyFiles[RSA Key Files]
        Memory[In-Memory Cache]
    end
    
    Router --> Auth
    Router --> JWKS
    Router --> Token
    
    Auth --> AuthMW
    Auth --> JWTSvc
    JWKS --> KeySvc
    Token --> JWTSvc
    
    JWTSvc --> KeySvc
    KeySvc --> KeyFiles
    Auth --> DBUtil
    DBUtil --> MongoDB
    
    CORS --> Router
    Helmet --> Router
    ErrorMW --> Router
    
    KeySvc --> Memory
    
    style JWTSvc fill:#e3f2fd
    style KeySvc fill:#f3e5f5
    style MongoDB fill:#e8f5e8
    style KeyFiles fill:#fff3e0
```

### API Endpoint Flow Mapping

| Endpoint | Controller | Service | Database | Keys |
|----------|------------|---------|----------|------|
| `POST /api/token/generate` | tokenController | jwtService | ❌ | ✅ |
| `POST /api/token/validate` | tokenController | jwtService | ❌ | ✅ |
| `POST /api/auth/register` | authController | jwtService | ✅ | ✅ |
| `POST /api/auth/login` | authController | jwtService | ✅ | ✅ |
| `GET /api/auth/profile` | authController | jwtService | ✅ | ✅ |
| `GET /api/jwks` | jwksController | keyService | ❌ | ✅ |
| `GET /api/public-key` | jwksController | keyService | ❌ | ✅ |
| `GET /health` | index.ts | database | ✅* | ❌ |

*Database check only (optional)

### Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        TLS[TLS/HTTPS Layer]
        CORS[CORS Protection]
        Helmet[Security Headers]
        RateLimit[Rate Limiting]
    end
    
    subgraph "Authentication Flow"
        JWT[JWT Tokens]
        RSA[RSA-256 Signing]
        JWKS[Public Key Distribution]
        Validation[Token Validation]
    end
    
    subgraph "Data Protection"
        BCrypt[Password Hashing]
        EnvVars[Environment Variables]
        KeyStorage[Secure Key Storage]
        GitIgnore[Repository Security]
    end
    
    TLS --> CORS
    CORS --> Helmet
    Helmet --> RateLimit
    RateLimit --> JWT
    
    JWT --> RSA
    RSA --> JWKS
    JWKS --> Validation
    
    BCrypt --> EnvVars
    EnvVars --> KeyStorage
    KeyStorage --> GitIgnore
    
    style TLS fill:#ffebee
    style RSA fill:#e8f5e8
    style BCrypt fill:#fff3e0
    style KeyStorage fill:#f3e5f5
```

## Workflow Examples

### 1. Quick Start Demo (No Database)

```bash
# Start the server
npm run dev

# Generate a demo token
curl -X POST http://localhost:3000/api/token/generate \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@example.com"}'

# Get JWKS for verification
curl http://localhost:3000/api/jwks

# Validate the token
curl -X POST http://localhost:3000/api/token/validate \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_JWT_TOKEN_HERE"}'
```

### 2. Full Authentication Flow (With Database)

```bash
# Set up environment
cp .env.example .env
# Edit .env: set SKIP_DATABASE=false and MONGODB_URI

# Start MongoDB and the server
npm run dev

# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"secret123"}'

# Login with credentials
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"secret123"}'

# Access protected endpoint
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. External Service Integration

```javascript
// External service using JWKS for verification
import * as jose from 'jose';

const JWKS_URL = 'http://your-jwt-api.com/api/jwks'\;

async function verifyToken(token) {
  const jwks = jose.createRemoteJWKSet(new URL(JWKS_URL));
  
  const { payload } = await jose.jwtVerify(token, jwks, {
    issuer: 'jwt-generator-app',
    audience: 'jwt-generator-api',
  });
  
  return payload; // Verified user data
}
```

This architecture ensures:
- **Scalability**: Stateless JWT tokens, shared key storage
- **Security**: RSA-256 signing, secure key management
- **Flexibility**: Database-optional design, configurable endpoints  
- **Standards Compliance**: JWKS, OpenID Connect compatible
- **Production Ready**: Docker, CI/CD, monitoring support
