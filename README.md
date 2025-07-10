# TweetSmash MCP Server

A Node.js Express server that bridges ChatGPT Custom Connector with TweetSmash API using Server-Sent Events.

## Requirements

- Node 18+ (uses the built-in global `fetch`)

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create a .env file and set your TweetSmash API key
#    (or export it in your shell)
TWEETSMASH_API_KEY=xxxxxxxx npm start
```

The server starts on `http://localhost:3000`. Endpoints:
- `POST /invoke`
- `GET  /health`

## Deploying to Vercel

1. Install the Vercel CLI (optional but handy):

```bash
npm i -g vercel
```

2. Link your project and create a new Vercel deployment:

```bash
vercel # follow prompts
```

3. Add the required environment variable in the Vercel dashboard **or** via CLI:

```bash
vercel env add TWEETSMASH_API_KEY
```

4. Redeploy (if you added the env var via the dashboard):

```bash
vercel deploy --prod
```

After deployment your endpoints will be available at:
```
https://<your-project>.vercel.app/invoke
https://<your-project>.vercel.app/health
```

## ChatGPT Custom Connector Configuration

1. **MCP Server URL**: `https://<your-project>.vercel.app/invoke`
2. **Authentication**: Bearer Token (value: **your TweetSmash API key**, optional — if provided in the request it overrides the environment variable)

## API Details

**POST /invoke**
- Body: `{ "tool_input": { "query": "<optional keyword>" } }`
- Response: Server-Sent Events (single event) containing TweetSmash bookmark JSON.
- The server always fetches up to **100** bookmarks, then filters them locally (case-insensitive match in tweet text or tags).
  - You can append a 4-digit year (e.g. "defi 2024") to restrict results to that year.

**GET /health**
- Simple health-check JSON.
