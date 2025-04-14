// server.js - Updated for Vercel deployment
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');

// Create Express app
const app = express();

// Enable CORS
app.use(cors({
  origin: '*',  // Allow all origins for testing
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Main handler function for Vercel
const handler = async (req, res) => {
  try {
    // Get the email and subscription level from the query params (GET) or request body (POST)
    const email = req.query.email || req.body?.email || 'guest@example.com';
    const level = req.query.level || req.body?.level || 'Light';
    const isAdmin = (req.query.isAdmin === 'true' || req.body?.isAdmin === true);
    
    console.log(`Generating token for: ${email}, Level: ${level}, Admin: ${isAdmin}`);
    
    // Get private key from environment variable instead of file system
    // This should be added in Vercel environment variables
    const privateKey = process.env.PRIVATE_KEY_BASE64 ? 
      Buffer.from(process.env.PRIVATE_KEY_BASE64, 'base64').toString('utf-8') : 
      'DEFAULT_PRIVATE_KEY_FOR_TESTING';
    
    // Get client ID from environment variables
    const clientId = process.env.TABLEAU_CLIENT_ID || '44b8edb0-ec57-475a-ab66-97df5ded751c';
    
    // Generate a unique JWT ID
    const jwtId = crypto.randomBytes(16).toString('hex');
    
    // Current time in seconds
    const now = Math.floor(Date.now() / 1000);
    const tokenExpirySeconds = 3600; // 1 hour
    
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
    res.status(500).json({ 
      error: 'Failed to generate token', 
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// Express routes
app.get('/', (req, res) => {
  res.send('JWT Server is running. Use /token endpoint to generate a token.');
});

app.get('/token', handler);
app.post('/token', handler);

// For local testing
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`JWT Server listening at http://localhost:${port}`);
  });
}

// Export handler for Vercel
module.exports = app;