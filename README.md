# TweetSmash MCP Server

A Node.js Express server that bridges ChatGPT Custom Connector with TweetSmash API using Server-Sent Events.

## Setup Instructions

### 1. Add TweetSmash API Key

In Replit, go to the **Secrets** tab (lock icon in the sidebar) and add:
- **Key**: `TWEETSMASH_API_KEY`
- **Value**: Your TweetSmash API key

### 2. Install Dependencies and Run

```bash
npm install && npm start
```

## Usage

### Public Endpoint

Your server will be available at:
```
https://<repl_username>.<repl_id>.repl.co/invoke
```

### ChatGPT Custom Connector Configuration

To connect this server to ChatGPT Custom Connector, use these settings:

1. **MCP Server URL**: `https://<repl_username>.<repl_id>.repl.co/invoke`
2. **Authentication**: 
   - Type: Bearer Token
   - Token: `<your_tweetsmash_api_key>` (same key used in Replit Secrets)

### API Endpoint Details

**POST /invoke**
- Accepts JSON body with optional `tool_input.query` parameter
- Fetches bookmarks from TweetSmash API (limit: 20)
- Returns data as Server-Sent Events stream
- Response format: `data: {"json": <tweetsmash_response>}\n\n`

**GET /health**
- Health check endpoint
- Returns: `{"status": "OK", "timestamp": "<current_time>"}`
