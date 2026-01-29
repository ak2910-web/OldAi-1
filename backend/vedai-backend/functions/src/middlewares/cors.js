/**
 * CORS Middleware
 * Handle Cross-Origin Resource Sharing
 */

function enableCORS(req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, X-User-Id, X-Preferred-Model');
    res.status(204).send('');
    return true; // Handled
  }
  
  return false; // Not handled, continue
}

module.exports = { enableCORS };
