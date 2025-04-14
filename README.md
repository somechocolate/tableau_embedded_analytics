# Tableau Embedded Analytics SAAS

This project implements a SAAS platform with embedded Tableau dashboards that provides different tiers of access based on user subscription levels. The application uses JWT authentication for secure, seamless access to Tableau dashboards without showing the Tableau login screen.

## Features

- JWT-based authentication with Tableau Connected Apps
- Tiered access to dashboards based on subscription level
- Row-level security implementation using USERNAME()
- Debug tools for testing and troubleshooting
- Responsive design for different screen sizes

## Prerequisites

- Node.js and npm
- Tableau Online/Cloud account with Creator license
- Connected App configured in Tableau (see setup instructions below)
- SSL certificate for production deployment (not required for local development)

## Setup Instructions

### 1. Generate JWT Keys

Run the following commands to generate the key pair for JWT authentication:

```bash
# Generate private key
openssl genrsa -out private.key 2048

# Generate public key from private key
openssl rsa -in private.key -outform PEM -pubout -out public.key

# Show the public key contents (you'll need this for Tableau Connected App)
cat public.key
```

### 2. Configure Tableau Connected App

1. Log in to your Tableau Online account as an admin
2. Navigate to Settings > Connected Apps
3. Click "Create New Connected App"
4. Provide a name (e.g., "SAAS Analytics Platform")
5. Select "Direct trust" for the authentication method
6. Paste your public key (from the step above)
7. Add your domain to the allowed domains list (e.g., "localhost" for testing)
8. Save the Connected App and note the Client ID

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure the Application

1. Update the client ID in `server.js` with your Tableau Connected App client ID
2. Ensure your private key is in the root directory (or update the path in server.js)
3. Update the dashboard URLs in `app.js` to point to your Tableau dashboards

### 5. Start the Server

```bash
npm start
```

The application should now be accessible at http://localhost:3000

## Tableau Dashboard Setup for Row-Level Security

To implement row-level security:

1. Create a calculated field in your Tableau dashboard: `[JWT User Email] = USERNAME()`
2. Create another calculated field: `[User Filter] = [Email] = [JWT User Email]`
3. Apply this filter to your data source
4. For testing with your admin account, you can temporarily hardcode the filter: `[User Filter] = [Email] = "youremail@example.com"`

## Wix Integration

To embed this in Wix:

1. Create a custom code element in your Wix site
2. Copy all the files to your Wix site's code section
3. Update the JWT server URL to point to your hosted server
4. Use Wix's user authentication system to get the current user's email and subscription level

## Production Deployment

For production:

1. Host the Node.js server on a secure platform (AWS, Azure, etc.)
2. Ensure you have HTTPS enabled with valid SSL certificates
3. Update all URLs to use HTTPS
4. Implement proper user authentication (e.g., OAuth, Wix login)
5. Store your private key securely (e.g., environment variables, secrets manager)
6. Remove test panels and debugging tools
7. Set up proper logging and monitoring

## License

# Tableau Embedded Analytics

JWT token server for embedding Tableau dashboards in a Wix website.

## Setup

1. Clone this repository
2. Install dependencies with `npm install`
3. Create a private.key and public.key file for JWT signing
4. Set up environment variables
5. Deploy to Vercel or run locally with `npm start`

## Environment Variables

- TABLEAU_CLIENT_ID: Your Tableau Connected App client ID
- PRIVATE_KEY_BASE64: Your private key encoded in Base64

## Usage

Send a POST request to `/token` with:
- email: User's email address
- level: Subscription level (Light, Basic, Premium)

## Local Development

MIT