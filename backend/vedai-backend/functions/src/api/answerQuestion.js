/**
 * Answer Question API Handler
 * Main endpoint for processing user questions
 * Uses hybrid engine: Classification → Template → AI → Formatting
 */

const { enableCORS } = require('../middlewares/cors');
const { ErrorCodes, AppError } = require('../utils/error-codes');
const { checkRateLimit } = require('../middlewares/rateLimit');
const { validateQuestion, validateLanguage, checkUserRateLimit } = require('../utils/validators');
const { getCachedResponse, saveToCache } = require('../services/cacheService');
const { callGeminiWithRetry } = require('../services/geminiService');
const { saveToSearchHistory, trackUserQuery } = require('../services/analyticsService');
const { classifyQuestionEnhanced } = require('../engines/questionClassifier');
const config = require('../config/env');
// Use optimized templates if feature flag is enabled
const templateEngine = config.features.useOptimizedPrompts 
  ? require('../engines/templateEngine.optimized')
  : require('../engines/templateEngine');
const { getTemplatePrompt, getOptimizedPrompt } = templateEngine;
const { formatResponse, extractSections, getPreview } = require('../engines/responseFormatter');
const { mapVedicToModern } = require('../engines/vedicMappingEngine');
const mathEngine = require('../engines/mathEngine');
const { db, FieldValue } = require('../config/firebase');

/**
 * Token counting (rough estimate)
 */
function countTokens(text) {
  // 1 token ≈ 4 chars (very rough)
  return Math.ceil((text || '').length / 4);
}

/**
 * Main question answering handler
 */
async function answerQuestion(req, res) {
  // Enable CORS
  if (enableCORS(req, res)) {
    return; // OPTIONS request handled
  }
  
  // Rate limiting
  if (!checkRateLimit('answerQuestion', req, res)) {
    return;
  }
  
  try {
    console.log("[LOG] Request body:", req.body);
    console.log("[LOG] Request method:", req.method);

    const question = req.body?.question;
    const language = req.body?.language || 'English';
    const userId = req.body?.userId || req.headers['x-user-id'];
    
    // STEP 1: VALIDATE INPUT
    const questionValidation = validateQuestion(question);
    if (!questionValidation.valid) {
      console.log(`[VALIDATION] Question rejected: ${questionValidation.error}`);
      throw new AppError(ErrorCodes.INVALID_QUESTION, questionValidation.error);
    }

    const languageValidation = validateLanguage(language);
    const sanitizedQuestion = questionValidation.sanitized;
    const sanitizedLanguage = languageValidation.sanitized;

    // STEP 2: CHECK RATE LIMIT
    const rateLimit = await checkUserRateLimit(userId, db);
    if (!rateLimit.allowed) {
      console.log(`[RATE LIMIT] User ${userId} exceeded daily limit`);
      throw new AppError(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        rateLimit.error,
        { remaining: rateLimit.remaining, resetTime: rateLimit.resetTime }
      );
    }

    console.log(`[PROCESSING] Processing question: ${sanitizedQuestion}`);
    console.log(`[LANGUAGE] Language: ${sanitizedLanguage}`);
    console.log(`[RATE LIMIT] Queries remaining today: ${rateLimit.remaining}`);

    const startTime = Date.now();

    // STEP 3: CHECK CACHE
    const cachedResponse = await getCachedResponse(sanitizedQuestion, sanitizedLanguage);
    if (cachedResponse) {
      console.log(`[CACHED] Returning cached response (saved ${Date.now() - startTime}ms)`);
      
      let parsedCache;
      try {
        parsedCache = JSON.parse(cachedResponse);
      } catch {
        parsedCache = { answer: cachedResponse };
      }
      
      return res.json({ 
        ...parsedCache,
        cached: true 
      });
    }

    console.log("[AI-LAYER1] LAYER 1: Classifying question type...");

    // STEP 4: MATHEMATICAL INTELLIGENCE ENGINE
    // Try to solve mathematically first for deterministic accuracy
    let mathSolution = null;
    try {
      console.log("[MATH-ENGINE] Attempting mathematical solution...");
      mathSolution = await mathEngine.solveMathProblem(sanitizedQuestion);
      
      if (mathSolution && mathSolution.solution && mathSolution.solution.success) {
        console.log(`[MATH-ENGINE] ✓ Solved using ${mathSolution.method}`);
        console.log(`[MATH-ENGINE] Result: ${mathSolution.solution.result || mathSolution.solution.solutions}`);
      } else {
        console.log("[MATH-ENGINE] No direct mathematical solution, proceeding to AI");
      }
    } catch (error) {
      console.error("[MATH-ENGINE] Error:", error.message);
    }
    
    // STEP 5: ENHANCED CLASSIFICATION WITH VEDIC SUTRA IDENTIFICATION
    const classification = classifyQuestionEnhanced(sanitizedQuestion);
    const questionType = classification.category;
    const vedicSutra = classification.vedicSutra;
    const isVedic = classification.isVedic;
    
    console.log(`[SUCCESS] Question classified as: ${questionType} (0ms, deterministic)`);
    if (vedicSutra) {
      console.log(`[VEDIC] Identified Vedic Sutra: ${vedicSutra}`);
    }
    
    // STEP 6: VEDIC MAPPING ENGINE
    let vedicMapping = null;
    if (isVedic) {
      console.log(`[VEDIC MAPPING] Attempting to map Vedic concept to modern framework...`);
      try {
        vedicMapping = await mapVedicToModern(vedicSutra || sanitizedQuestion);
        if (vedicMapping) {
          console.log(`[VEDIC MAPPING] ✓ Successfully mapped to: ${vedicMapping.modern_equivalent}`);
          console.log(`[VEDIC MAPPING] Confidence: ${(vedicMapping.confidence_score * 100).toFixed(0)}%`);
        } else {
          console.log(`[VEDIC MAPPING] No mapping found in knowledge base`);
        }
      } catch (error) {
        console.error(`[VEDIC MAPPING] Mapping failed:`, error.message);
      }
    }
    
    console.log(`[AI-LAYER2] LAYER 2: Selecting template for "${questionType}"...`);
    
    // STEP 7: TEMPLATE SELECTION (use optimized if enabled)
    let enhancedPrompt;
    if (config.features.useOptimizedPrompts) {
      console.log('[OPTIMIZATION] Using token-optimized prompts (60% reduction)');
      enhancedPrompt = getOptimizedPrompt(questionType, sanitizedQuestion, sanitizedLanguage, vedicMapping);
    } else {
      enhancedPrompt = getTemplatePrompt(questionType, sanitizedQuestion, sanitizedLanguage, vedicMapping);
    }
    
    // If we have a mathematical solution, add it to the prompt
    if (mathSolution && mathSolution.solution && mathSolution.solution.success) {
      const mathExplanation = mathEngine.generateExplanation(mathSolution.solution, mathSolution.classification);
      enhancedPrompt += `\n\n[VERIFIED MATHEMATICAL SOLUTION - Use this as the accurate answer and explain it clearly]:
${mathExplanation}

Your task: Explain this solution in a clear, educational way. Add context, examples, and teaching points. DO NOT recalculate - this solution is already verified.`;
    }
    
    console.log(`[AI-LAYER3] LAYER 3: Generating AI response (single call)...`);
    
    // STEP 8: CALL GEMINI API
    const rawResponse = await callGeminiWithRetry(enhancedPrompt);
    
    console.log(`[AI-LAYER4] LAYER 4: Formatting response...`);
    
    // STEP 9: FORMAT RESPONSE
    const formattedAnswer = formatResponse(rawResponse);
    const sections = extractSections(formattedAnswer);
    const preview = getPreview(formattedAnswer);
    
    // Token counting
    const tokenCount = countTokens(rawResponse);
    
    console.log(`[SUCCESS] Response generated successfully in ${Date.now() - startTime}ms`);
    console.log(`[STATS] Question Type: ${questionType}`);
    console.log(`[STATS] Token Count: ${tokenCount}`);
    console.log(`[STATS] Sections Extracted: ${Object.keys(sections).length}`);
    console.log(`[DEBUG] Section names found:`, Object.keys(sections).join(', '));
    
    // STEP 10: PREPARE RESPONSE
    const responseData = {
      answer: formattedAnswer,
      questionType,
      sections,
      tokenCount,
      cached: false,
      processingTime: Date.now() - startTime,
      // Include mathematical solution if computed
      mathematicalSolution: mathSolution ? {
        method: mathSolution.method,
        result: mathSolution.solution?.result || mathSolution.solution?.solutions,
        domain: mathSolution.classification?.primaryDomain,
        confidence: mathSolution.confidence,
        verified: mathSolution.solution?.verified,
        processingTime: mathSolution.processingTime
      } : null,
      // Include Vedic mapping data if available
      vedicMapping: vedicMapping ? {
        sutraName: vedicMapping.short_name,
        modernEquivalent: vedicMapping.modern_equivalent,
        mathematicalField: vedicMapping.mathematical_field,
        confidenceScore: vedicMapping.confidence_score,
        applications: vedicMapping.practical_applications,
        crossDomainConnections: vedicMapping.cross_domain_connections
      } : null,
      vedicSutra: vedicSutra
    };
    
    // STEP 11: SAVE TO CACHE & HISTORY (async - don't block response)
    saveToCache(sanitizedQuestion, sanitizedLanguage, JSON.stringify(responseData)).catch(err => 
      console.error('[CACHE-ERROR]', err.message)
    );
    
    // STEP 12: RETURN RESPONSE IMMEDIATELY (analytics run async)
    res.json(responseData);
    
    // POST-RESPONSE: Fire-and-forget analytics (don't await)
    saveToSearchHistory(sanitizedQuestion, sanitizedLanguage, preview).catch(err =>
      console.error('[ANALYTICS-ERROR] Failed to save search history:', err.message)
    );
    
    // Track user query (async)
    if (userId) {
      trackUserQuery(userId, sanitizedQuestion, sanitizedLanguage).catch(err =>
        console.error('[ANALYTICS-ERROR] Failed to track user query:', err.message)
      );
    }
    
    // Log API usage (async)
    // Log API usage (async)
    try {
      if (FieldValue && FieldValue.serverTimestamp) {
        db.collection('apiUsage').add({
          endpoint: 'answerQuestion',
          questionLength: sanitizedQuestion.length,
          language: sanitizedLanguage,
          questionType,
          tokenCount,
          processingTime: Date.now() - startTime,
          userId: userId || 'anonymous',
          timestamp: FieldValue.serverTimestamp()
        }).catch(err => console.error('[ANALYTICS-ERROR] Failed to log API usage:', err.message));
      }
    } catch (logError) {
      console.error('[ANALYTICS-ERROR] Failed to log API usage:', logError.message);
    }
    
  } catch (error) {
    console.error("[ERROR] Error in answerQuestion:", error);
    
    // Enhanced error handling
    let errorResponse = {
      error: true,
      message: "An unexpected error occurred",
      errorCode: "UNKNOWN_ERROR",
      retryable: false
    };
    
    // Handle specific error types
    if (error.message && error.message.includes('QUOTA_EXHAUSTED')) {
      // GRACEFUL DEGRADATION: All keys exhausted
      errorResponse = {
        error: true,
        message: "AI service temporarily at capacity. Showing cached or basic result.",
        errorCode: "QUOTA_EXHAUSTED",
        retryable: true,
        retryAfter: 120, // 2 minutes
        suggestion: "Try again in 2 minutes, or check cache for similar questions"
      };
    } else if (error.message && error.message.includes('Rate limit')) {
      errorResponse = {
        error: true,
        message: "AI service rate limit reached. Please try again in a moment.",
        errorCode: "RATE_LIMIT_EXCEEDED",
        retryable: true,
        retryAfter: 60
      };
    } else if (error.message && error.message.includes('overloaded')) {
      return res.status(502).json(
        new AppError(ErrorCodes.AI_SERVICE_ERROR, 'AI service busy, try again shortly', { retryAfter: 30 }).toJSON()
      );
    } else if (error.message && error.message.includes('RESOURCE_EXHAUSTED')) {
      return res.status(503).json(
        new AppError(ErrorCodes.QUOTA_EXHAUSTED, 'Daily AI quota exceeded').toJSON()
      );
    }
    
    // Log error to Firestore (fire-and-forget)
    db.collection('errorLogs').add({
      endpoint: 'answerQuestion',
      error: error.message,
      question: req.body?.question?.substring(0, 100),
      timestamp: FieldValue.serverTimestamp(),
      stack: error.stack
    }).catch(logError => {
      console.error('[WARN] Failed to log error:', logError.message);
    });
    
    // Generic error fallback
    return res.status(500).json(
      new AppError(ErrorCodes.INTERNAL_ERROR, error.message || 'Error generating response').toJSON()
    );
  }
}

module.exports = answerQuestion;
