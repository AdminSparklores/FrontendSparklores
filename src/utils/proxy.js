export default async function handler(req, res) {
  const { path } = req.query;
  // console.log("REQ.QUERY.PATH:", path);
    // console.log("Full target URL:", targetUrl);
    res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Validate the path exists
  if (!path) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  // Construct the target URL
  const targetUrl = `http://sparkloreofficial.com/${path.replace(/^\/+/, '')}`;
  // console.log('Proxying to:', targetUrl); // For debugging
  

  try {
    const response = await fetch(targetUrl, {
        redirect: 'follow',
        headers: {
            'Accept': req.headers['accept'] || '*/*',
        }
        });

    const text = await response.text();
    // console.log("RESPONSE STATUS:", response.status);
    // console.log("RESPONSE TEXT:", text); // Log 404 page to confirm source

    res.status(response.status).send(text);


    // Check if response is successful
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    // Get the response content type
    const contentType = response.headers.get('content-type') || 'text/html';
    res.setHeader('Content-Type', contentType);

    // Return the response body
    const data = await response.text();
    res.status(response.status).send(data);
    
  } catch (error) {
    // console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy request',
      details: error.message,
      targetUrl: targetUrl
    });
  }
}