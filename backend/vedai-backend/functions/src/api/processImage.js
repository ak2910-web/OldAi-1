/**
 * Process Image API Handler
 * Handles image analysis using Gemini Vision API
 */

const { enableCORS } = require('../middlewares/cors');
const { checkRateLimit } = require('../middlewares/rateLimit');
const { callGeminiVisionWithRetry } = require('../services/geminiService');
const { saveToSearchHistory } = require('../services/analyticsService');
const { generateAncientModernPrompt } = require('../utils/promptTemplates');

async function processImage(req, res) {
  // Enable CORS
  if (enableCORS(req, res)) {
    return;
  }
  
  // Rate limiting
  if (!checkRateLimit('processImage', req, res)) {
    return;
  }

  try {
    console.log("[IMAGE] Processing image request...");

    const { base64Image, mimeType } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ error: "No image provided in request body" });
    }

    console.log(`[IMAGE] Image type: ${mimeType || 'image/jpeg'}`);
    console.log("[ANALYSIS] Analyzing image with Gemini Vision...");

    const startTime = Date.now();
    
    const language = req.body?.language || 'English';
    console.log(`[LANGUAGE] Language: ${language}`);

    // Build image analysis prompt
    const imagePrompt = `Analyze this image and identify any mathematical concepts, formulas, or problems shown. If it contains:
- A mathematical formula or equation: Explain it from both ancient Vedic and modern mathematical perspectives
- A mathematical problem: Solve it step-by-step using both approaches
- Text or concept: Explain the concept comprehensively

Follow this structure:

${generateAncientModernPrompt('[Extract the main topic/problem from the image]', language)}

IMPORTANT: Be accurate and educational. Mix descriptive paragraphs with clear bullet points.`;

    // Prepare image data for Gemini Vision API
    const imageData = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType || 'image/jpeg'
      }
    };

    // Call Gemini Vision API
    const text = await callGeminiVisionWithRetry(imagePrompt, imageData);
    
    console.log(`[TIME] Total image processing took ${Date.now() - startTime}ms`);
    console.log("[SUCCESS] Image processed successfully");

    // Save to search history
    saveToSearchHistory('Image Analysis', language, text.substring(0, 200)).catch(err =>
      console.error('Failed to save search history:', err)
    );

    res.json({ answer: text });
    
  } catch (error) {
    console.error("[ERROR] Image processing error:", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = processImage;
