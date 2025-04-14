// server.js - JWT token generation server with improved CORS
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const app = express();
const port = 3000;

// Configure CORS more explicitly
const corsOptions = {
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Add pre-flight OPTIONS for all routes
app.options('*', cors(corsOptions));

// Load the private key - In production, store this securely and use environment variables
// You will need to generate a private-public key pair for your Tableau Connected App
const privateKey = fs.readFileSync('private.key', 'utf8');

// Connected App client ID from Tableau (use your actual client ID)
const clientId = '44b8edb0-ec57-475a-ab66-97df5ded751c'; // From your Connected App

// Token expiration time (in seconds)
const tokenExpirySeconds = 3600; // 1 hour

// Add additional headers for CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

app.get('/token', (req, res) => {
  try {
    // Get the email and subscription level from the query params
    const email = req.query.email || 'guest@example.com';
    const level = req.query.level || 'Light';
    const isAdmin = req.query.isAdmin === 'true';
    
    console.log(`Generating token for: ${email}, Level: ${level}, Admin: ${isAdmin}`);
    
    // Generate a unique JWT ID
    const jwtId = crypto.randomBytes(16).toString('hex');
    
    // Current time in seconds
    const now = Math.floor(Date.now() / 1000);
    
    // Create the JWT payload
    const payload = {
      // Standard JWT claims
      iss: clientId, // Issuer - must be your Connected App client ID
      sub: email,     // Subject - the user's email
      aud: 'tableau', // Audience - must be 'tableau' for Tableau Cloud
      exp: now + tokenExpirySeconds, // Expiration time
      iat: now,       // Issued at time
      jti: jwtId,     // JWT ID - must be unique for each token
      
      // Custom claims for your app (optional)
      'scp': ['tableau:views:embed', 'tableau:content:read'], // Scopes
      'userLevel': level,
      'isAdmin': isAdmin
    };
    
    // Sign the JWT with the private key
    const token = jwt.sign(payload, privateKey, { 
      algorithm: 'RS256' 
    });
    
    // Return the token and some of the payload data for debugging
    res.json({
      token,
      email,
      sub: email,
      aud: 'tableau',
      iss: clientId,
      jti: jwtId,
      exp: payload.exp,
      timestamp: now
    });
    
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token', message: error.message });
  }
});

// Add a route to test the server
app.get('/', (req, res) => {
  res.send('JWT Server is running. Use /token endpoint to generate a token.');
});

// Add a specific health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`JWT Server listening at http://localhost:${port}`);
  console.log(`CORS enabled for: ${corsOptions.origin.join(', ')}`);
});