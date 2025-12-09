/**
 * CLASSIFICATION LAYER
 * Detects question type and returns appropriate category
 */

const QUESTION_CATEGORIES = {
  VEDIC_COMPUTATIONAL: 'vedic',
  ARITHMETIC: 'arithmetic',
  ALGEBRA: 'algebra',
  GEOMETRY: 'geometry',
  TRIGONOMETRY: 'trigonometry',
  FORMULA_DERIVATION: 'formula',
  GENERAL_CONCEPT: 'concept',
  WORD_PROBLEM: 'word_problem',
  HISTORY_CULTURE: 'history',
  MISCELLANEOUS: 'misc'
};

/**
 * Generate classification prompt for AI
 * @param {string} question - User's question
 * @returns {string} - Classification prompt
 */
const getClassificationPrompt = (question) => {
  return `Analyze this mathematical question and classify it into EXACTLY ONE category.

Categories:
- "vedic": Vedic mathematics computational methods (squares ending in 5, Nikhilam method, Urdhva Tiryagbhyam, specific Vedic sutras)
- "arithmetic": Basic arithmetic operations (addition, subtraction, multiplication, division, percentages, basic squaring/cubing)
- "algebra": Algebraic operations (equations, inequalities, factorization, polynomials, systems of equations)
- "geometry": Geometric concepts (shapes, area, perimeter, volume, angles, theorems like Pythagoras)
- "trigonometry": Trigonometric functions and identities (sin, cos, tan, trigonometric equations)
- "formula": Formula derivation or explanation requests (asks to "derive", "prove", or "explain formula")
- "concept": General mathematical concepts or theory (theorems, properties, definitions, "what is", "explain")
- "word_problem": Real-life word problems with context (story problems, application problems)
- "history": Historical or cultural questions about mathematics (origin, discovery, ancient mathematicians)
- "misc": Miscellaneous or unclear mathematical questions

Question: "${question}"

Respond with ONLY the category name (vedic, arithmetic, algebra, geometry, trigonometry, formula, concept, word_problem, history, or misc). 
No explanation, just the category.`;
};

/**
 * Parse classification response
 * @param {string} response - AI response
 * @returns {string} - Validated category
 */
const parseClassificationResponse = (response) => {
  const cleaned = response.trim().toLowerCase();
  
  // Map response to valid categories
  const validCategories = Object.values(QUESTION_CATEGORIES);
  
  if (validCategories.includes(cleaned)) {
    return cleaned;
  }
  
  // Fallback patterns
  if (cleaned.includes('vedic') || cleaned.includes('sutra')) return QUESTION_CATEGORIES.VEDIC_COMPUTATIONAL;
  if (cleaned.includes('arithmetic') || cleaned.includes('basic')) return QUESTION_CATEGORIES.ARITHMETIC;
  if (cleaned.includes('algebra') || cleaned.includes('equation')) return QUESTION_CATEGORIES.ALGEBRA;
  if (cleaned.includes('geometry') || cleaned.includes('shape')) return QUESTION_CATEGORIES.GEOMETRY;
  if (cleaned.includes('trigonometry') || cleaned.includes('trig')) return QUESTION_CATEGORIES.TRIGONOMETRY;
  if (cleaned.includes('formula') || cleaned.includes('derive')) return QUESTION_CATEGORIES.FORMULA_DERIVATION;
  if (cleaned.includes('concept') || cleaned.includes('theory')) return QUESTION_CATEGORIES.GENERAL_CONCEPT;
  if (cleaned.includes('word') || cleaned.includes('problem')) return QUESTION_CATEGORIES.WORD_PROBLEM;
  if (cleaned.includes('history') || cleaned.includes('culture')) return QUESTION_CATEGORIES.HISTORY_CULTURE;
  
  // Default fallback
  console.warn(`⚠️ Unknown classification response: "${response}", defaulting to misc`);
  return QUESTION_CATEGORIES.MISCELLANEOUS;
};

module.exports = {
  QUESTION_CATEGORIES,
  getClassificationPrompt,
  parseClassificationResponse
};
