const express = require('express');
// Using built-in fetch (available in Node 18+)

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// POST route to handle ChatGPT Custom Connector requests
app.post('/invoke', async (req, res) => {
  try {
    // Extract tool_input.query from request body (optional)
    const query = req.body?.tool_input?.query;
    
    // Get TweetSmash API key from env or Authorization header
    const apiKey = req.headers['authorization']?.replace(/^Bearer\s+/i, '') || process.env.TWEETSMASH_API_KEY;
    
    if (!apiKey) {
      console.error('TWEETSMASH_API_KEY environment variable is not set');
      res.status(500).json({ error: 'API key not configured' });
      return;
    }

    const fetchLimit = 100;
    // Make authenticated request to TweetSmash API
    const tweetsmashResponse = await fetch(`https://api.tweetsmash.com/v1/bookmarks?limit=${fetchLimit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!tweetsmashResponse.ok) {
      console.error(`TweetSmash API error: ${tweetsmashResponse.status} ${tweetsmashResponse.statusText}`);
      res.status(tweetsmashResponse.status).json({ 
        error: `TweetSmash API error: ${tweetsmashResponse.status} ${tweetsmashResponse.statusText}` 
      });
      return;
    }

    const tweetsmashData = await tweetsmashResponse.json();

    // If a query was provided, filter the bookmarks client-side (case-insensitive search)
    let finalData = tweetsmashData;
    if (query) {
      // Extract optional year filter from query (e.g., "defi 2024")
      let searchText = query;
      let yearFilter = null;
      if (query) {
        const m = query.match(/\b(20\d{2})\b/);
        if (m) {
          yearFilter = m[1];
          searchText = query.replace(m[1], '').trim();
        }
      }
      const items = tweetsmashData.data || tweetsmashData; // defensive in case of different shapes
      const filtered = items.filter(item => {
        const text = item.tweet_details?.text?.toLowerCase() || "";
        const tagsStr = (item.tags || []).join(" ").toLowerCase();
        const matchesKeyword = searchText ? (text.includes(searchText.toLowerCase()) || tagsStr.includes(searchText.toLowerCase())) : true;
        const matchesYear = yearFilter ? (item.tweet_details?.posted_at?.startsWith(yearFilter)) : true;
        return matchesKeyword && matchesYear;
      });
      finalData = { ...tweetsmashData, data: filtered };
    }

    // Set Server-Sent Event headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Send the TweetSmash response wrapped in a Server-Sent Event
    const eventData = JSON.stringify({ json: finalData });
    res.write(`data: ${eventData}\n\n`);
    
    // End the stream
    res.end();

    console.log('Successfully processed /invoke request');

  } catch (error) {
    console.error('Error processing /invoke request:', error);
    
    // If headers haven't been sent yet, send error response
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message 
      });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the server (only in local/dev environments)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TweetSmash MCP Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Invoke endpoint: http://localhost:${PORT}/invoke`);
  });
}

// Export the app for serverless environments (e.g., Vercel)
module.exports = app;
