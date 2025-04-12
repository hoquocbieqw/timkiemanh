// functions/unsplash-proxy.js
exports.handler = async function(event) {
  // Get parameters from query string
  const { query, page, per_page, orientation } = event.queryStringParameters || {};
  
  // Check required parameters
  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Search query is required" })
    };
  }
  
  try {
    // Build API URL with parameters
    let url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page || 1}&per_page=${per_page || 20}`;
    
    if (orientation && orientation !== 'all') {
      url += `&orientation=${orientation}`;
    }
    
    // Call API with API key from environment variable
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_API_KEY}`
      }
    });
    
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `API Error: ${response.statusText}` })
      };
    }
    
    // Convert result and return
    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${error.message}` })
    };
  }
}