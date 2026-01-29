/**
 * Rate Limiting Middleware
 * Prevent API abuse with IP-based rate limiting
 */

const config = require('../config/env');

// In-memory rate limiter (per IP, per endpoint)
const rateLimitMap = {};

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.ip ||
    req.connection?.remoteAddress ||
    'unknown'
  );
}

function checkRateLimit(endpoint, req, res) {
  // Disable rate limiting in emulator mode
  if (config.isEmulator) {
    console.log('[RATE-LIMIT] Disabled in emulator mode');
    return true;
  }
  
  const ip = getClientIp(req);
  const key = `${endpoint}:${ip}`;
  const now = Date.now();
  
  if (!rateLimitMap[key]) {
    rateLimitMap[key] = [];
  }
  
  // Remove old timestamps
  rateLimitMap[key] = rateLimitMap[key].filter(
    ts => now - ts < config.rateLimit.windowMs
  );
  
  if (rateLimitMap[key].length >= config.rateLimit.maxRequests) {
    res.status(429).json({
      error: `Rate limit exceeded: ${config.rateLimit.maxRequests} requests per minute.`
    });
    return false;
  }
  
  rateLimitMap[key].push(now);
  return true;
}

module.exports = { checkRateLimit };
