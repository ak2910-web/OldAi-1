/**
 * INPUT VALIDATION & SANITIZATION
 * Prevents prompt injection, XSS, and other security issues
 */

/**
 * Validate and sanitize user question input
 * @param {string} question - User's question
 * @returns {object} - { valid: boolean, sanitized: string, error: string }
 */
const validateQuestion = (question) => {
  if (!question || typeof question !== 'string') {
    return {
      valid: false,
      sanitized: '',
      error: 'Question is required and must be text'
    };
  }

  // Trim whitespace
  let sanitized = question.trim();

  // Check minimum length
  if (sanitized.length < 3) {
    return {
      valid: false,
      sanitized: '',
      error: 'Question must be at least 3 characters long'
    };
  }

  // Check maximum length (500 characters)
  if (sanitized.length > 500) {
    return {
      valid: false,
      sanitized: '',
      error: 'Question cannot exceed 500 characters'
    };
  }

  // Remove potential HTML/script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Check for excessive special characters (potential injection)
  const specialCharCount = (sanitized.match(/[^a-zA-Z0-9\s.,?!+=\-*/()[\]{}]/g) || []).length;
  const totalChars = sanitized.length;
  
  if (specialCharCount / totalChars > 0.3) {
    return {
      valid: false,
      sanitized: '',
      error: 'Question contains too many special characters'
    };
  }

  // Check for potential prompt injection patterns
  const suspiciousPatterns = [
    /ignore\s+(previous|all|above)\s+instructions/i,
    /system\s*:\s*/i,
    /assistant\s*:\s*/i,
    /\[INST\]/i,
    /<\|im_start\|>/i,
    /you\s+are\s+now/i,
    /forget\s+(everything|all|previous)/i,
    /roleplay\s+as/i,
    /pretend\s+(you|to)\s+are/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      console.warn('[SECURITY] Potential prompt injection detected:', sanitized.substring(0, 50));
      return {
        valid: false,
        sanitized: '',
        error: 'Question contains restricted patterns. Please rephrase.'
      };
    }
  }

  // Check for excessive repetition (spam)
  const words = sanitized.split(/\s+/);
  const uniqueWords = new Set(words);
  if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
    return {
      valid: false,
      sanitized: '',
      error: 'Question contains too much repetition'
    };
  }

  return {
    valid: true,
    sanitized: sanitized,
    error: null
  };
};

/**
 * Validate language parameter
 * @param {string} language - Language code
 * @returns {object} - { valid: boolean, sanitized: string }
 */
const validateLanguage = (language) => {
  const allowedLanguages = ['English', 'Hindi', 'Sanskrit'];
  
  if (!language || typeof language !== 'string') {
    return { valid: true, sanitized: 'English' }; // Default
  }

  const sanitized = language.trim();
  
  if (!allowedLanguages.includes(sanitized)) {
    return { valid: true, sanitized: 'English' }; // Default
  }

  return { valid: true, sanitized };
};

/**
 * Validate base64 image
 * @param {string} base64Image - Base64 encoded image
 * @param {string} mimeType - MIME type
 * @returns {object} - { valid: boolean, error: string }
 */
const validateImage = (base64Image, mimeType) => {
  if (!base64Image || typeof base64Image !== 'string') {
    return {
      valid: false,
      error: 'Image data is required'
    };
  }

  // Check if it's valid base64
  const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
  const cleanedBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
  
  if (!base64Regex.test(cleanedBase64)) {
    return {
      valid: false,
      error: 'Invalid image format'
    };
  }

  // Check size (max 5MB)
  const sizeInBytes = (cleanedBase64.length * 3) / 4;
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (sizeInBytes > maxSize) {
    return {
      valid: false,
      error: 'Image size exceeds 5MB limit'
    };
  }

  // Validate MIME type
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (mimeType && !allowedMimeTypes.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: 'Unsupported image format. Use JPG, PNG, or WebP'
    };
  }

  return {
    valid: true,
    error: null
  };
};

/**
 * Rate limiting check (user-side)
 * @param {string} userId - User ID
 * @param {object} db - Firestore database instance
 * @returns {Promise<object>} - { allowed: boolean, remaining: number, resetTime: number }
 */
const checkUserRateLimit = async (userId, db) => {
  if (!userId) {
    return { allowed: true, remaining: 100, resetTime: null };
  }

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const userRateLimitDoc = db.collection('userRateLimits').doc(`${userId}_${today}`);
    
    const doc = await userRateLimitDoc.get();
    const MAX_DAILY_QUERIES = 100; // Free tier limit

    if (!doc.exists) {
      // First query today
      await userRateLimitDoc.set({
        userId,
        date: today,
        count: 1,
        firstQueryAt: new Date(),
        lastQueryAt: new Date()
      });

      return {
        allowed: true,
        remaining: MAX_DAILY_QUERIES - 1,
        resetTime: new Date().setHours(24, 0, 0, 0) // Midnight tonight
      };
    }

    const data = doc.data();
    const currentCount = data.count || 0;

    if (currentCount >= MAX_DAILY_QUERIES) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date().setHours(24, 0, 0, 0),
        error: `Daily limit of ${MAX_DAILY_QUERIES} queries reached. Resets at midnight.`
      };
    }

    // Increment count
    await userRateLimitDoc.update({
      count: currentCount + 1,
      lastQueryAt: new Date()
    });

    return {
      allowed: true,
      remaining: MAX_DAILY_QUERIES - (currentCount + 1),
      resetTime: new Date().setHours(24, 0, 0, 0)
    };

  } catch (error) {
    console.error('[RATE LIMIT] Check failed:', error);
    // On error, allow the request (fail open)
    return { allowed: true, remaining: null, resetTime: null };
  }
};

/**
 * Get user's current usage stats
 * @param {string} userId - User ID
 * @param {object} db - Firestore database instance
 * @returns {Promise<object>} - { queriesUsed: number, queriesRemaining: number, imagesUsed: number }
 */
const getUserUsageStats = async (userId, db) => {
  if (!userId) {
    return { queriesUsed: 0, queriesRemaining: 100, imagesUsed: 0 };
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const userRateLimitDoc = await db.collection('userRateLimits').doc(`${userId}_${today}`).get();
    
    const MAX_DAILY_QUERIES = 100;
    const MAX_DAILY_IMAGES = 20;

    if (!userRateLimitDoc.exists) {
      return {
        queriesUsed: 0,
        queriesRemaining: MAX_DAILY_QUERIES,
        imagesUsed: 0,
        imagesRemaining: MAX_DAILY_IMAGES
      };
    }

    const data = userRateLimitDoc.data();
    return {
      queriesUsed: data.count || 0,
      queriesRemaining: Math.max(0, MAX_DAILY_QUERIES - (data.count || 0)),
      imagesUsed: data.imageCount || 0,
      imagesRemaining: Math.max(0, MAX_DAILY_IMAGES - (data.imageCount || 0))
    };

  } catch (error) {
    console.error('[USAGE STATS] Fetch failed:', error);
    return { queriesUsed: 0, queriesRemaining: 100, imagesUsed: 0, imagesRemaining: 20 };
  }
};

module.exports = {
  validateQuestion,
  validateLanguage,
  validateImage,
  checkUserRateLimit,
  getUserUsageStats
};
