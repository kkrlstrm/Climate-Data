// api/proxy.js - Vercel serverless function
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' });
    }
    
    console.log('Proxying request to:', url);
    
    const response = await fetch(decodeURIComponent(url), {
      method: 'GET',
      headers: {
        'User-Agent': 'Grid-Weather-Monitor/1.0'
      }
    });
    
    if (!response.ok) {
      console.error('Upstream error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: `Upstream error: ${response.status} ${response.statusText}` 
      });
    }
    
    const data = await response.text();
    
    console.log('Response length:', data.length);
    
    // Set appropriate content type
    if (url.includes('xml') || data.trim().startsWith('<?xml')) {
      res.setHeader('Content-Type', 'application/xml');
    } else {
      res.setHeader('Content-Type', 'text/plain');
    }
    
    res.status(200).send(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy failed',
      message: error.message 
    });
  }
}
