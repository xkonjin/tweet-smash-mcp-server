# TweetSmash MCP Server

## Overview

This is a Node.js Express server that acts as a bridge between ChatGPT Custom Connector and the TweetSmash API. The server receives requests from ChatGPT, fetches bookmark data from TweetSmash API, and streams the response back using Server-Sent Events (SSE).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a simple proxy server architecture:

- **Frontend**: No frontend interface - designed to be consumed by ChatGPT Custom Connector
- **Backend**: Express.js server with a single POST endpoint
- **External API**: TweetSmash API for bookmark data
- **Communication**: Server-Sent Events for real-time data streaming

## Key Components

### Express Server
- Single POST endpoint `/invoke` that handles all requests
- Middleware for JSON parsing
- CORS headers for cross-origin requests
- Error handling for API failures

### TweetSmash API Integration
- Bearer token authentication using environment variable
- Fetches bookmark data with a limit of 20 items
- Handles API errors and forwards appropriate status codes

### Server-Sent Events
- Streams data back to client in real-time
- Sets appropriate SSE headers for connection management
- Enables live data updates without polling

## Data Flow

1. ChatGPT Custom Connector sends POST request to `/invoke`
2. Server extracts optional query parameter from request body
3. Server authenticates with TweetSmash API using Bearer token
4. Server fetches bookmark data from TweetSmash API
5. Server streams response back using Server-Sent Events
6. Client receives real-time data updates

## External Dependencies

### Runtime Dependencies
- **express**: Web framework for handling HTTP requests
- **node-fetch**: HTTP client for making API calls to TweetSmash

### Environment Variables
- `TWEETSMASH_API_KEY`: Required Bearer token for TweetSmash API authentication (currently configured)
- `PORT`: Optional port number (defaults to 3000)

## Deployment Strategy

The application is designed for simple deployment:

- **Configuration**: Environment variables for API keys and port
- **Dependencies**: Minimal Node.js dependencies for easy deployment
- **Scalability**: Single-threaded Express server suitable for light to moderate load
- **Monitoring**: Basic console logging for errors and API failures

### Deployment Requirements
- Node.js runtime environment
- Access to TweetSmash API
- Environment variable management for API keys
- Network access for outbound HTTPS requests

The server is stateless and can be easily containerized or deployed to cloud platforms like Heroku, Railway, or similar services.