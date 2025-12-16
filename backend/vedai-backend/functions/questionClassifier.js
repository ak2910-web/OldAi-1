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
 * RULE-BASED CLASSIFICATION (NO AI NEEDED)
 * Fast, deterministic, zero-cost classification
 * @param {string} question - User's question
 * @returns {string} - Category
 */
const classifyQuestion = (question) => {
  const q = question.toLowerCase();
  
  // Priority 1: Vedic-specific keywords
  if (q.includes('vedic') || q.includes('sutra') || q.includes('nikhilam') || 
      q.includes('urdhva') || q.includes('tiryagbhyam') || q.includes('ekadhikena') ||
      q.includes('anurupyena') || q.includes('yavadunam') || q.includes('vertically and crosswise')) {
    return QUESTION_CATEGORIES.VEDIC_COMPUTATIONAL;
  }
  
  // Priority 2: Historical/cultural
  if (q.includes('history') || q.includes('origin') || q.includes('discovered') ||
      q.includes('ancient') || q.includes('who invented') || q.includes('who discovered') ||
      q.includes('when was') || q.includes('culture')) {
    return QUESTION_CATEGORIES.HISTORY_CULTURE;
  }
  
  // Priority 3: Formula derivation
  if (q.includes('derive') || q.includes('proof') || q.includes('prove') ||
      q.includes('derivation') || q.includes('how to get') || q.includes('where does') ||
      (q.includes('formula') && (q.includes('explain') || q.includes('derive')))) {
    return QUESTION_CATEGORIES.FORMULA_DERIVATION;
  }
  
  // Priority 4: Geometry
  if (q.includes('triangle') || q.includes('circle') || q.includes('square') || q.includes('rectangle') ||
      q.includes('area') || q.includes('perimeter') || q.includes('volume') || q.includes('angle') ||
      q.includes('pythagoras') || q.includes('geometry') || q.includes('polygon') || q.includes('diameter')) {
    return QUESTION_CATEGORIES.GEOMETRY;
  }
  
  // Priority 5: Trigonometry
  if (q.includes('sin') || q.includes('cos') || q.includes('tan') || q.includes('trigonometry') ||
      q.includes('sine') || q.includes('cosine') || q.includes('tangent') || q.includes('radian') ||
      q.includes('degree') && (q.includes('sin') || q.includes('cos'))) {
    return QUESTION_CATEGORIES.TRIGONOMETRY;
  }
  
  // Priority 6: Algebra
  if (q.includes('equation') || q.includes('solve') || q.includes('x =') || q.includes('y =') ||
      q.includes('polynomial') || q.includes('quadratic') || q.includes('factorize') ||
      q.includes('algebra') || q.includes('inequality') || q.includes('variable')) {
    return QUESTION_CATEGORIES.ALGEBRA;
  }
  
  // Priority 7: Word problems
  if ((q.includes('if') && q.includes('how many')) || q.includes('train') || q.includes('person') ||
      q.includes('age') || q.includes('speed') || q.includes('distance') || q.includes('time') ||
      q.includes('john') || q.includes('mary') || q.split(' ').length > 15) {
    return QUESTION_CATEGORIES.WORD_PROBLEM;
  }
  
  // Priority 8: Conceptual (what is, explain, etc)
  if (q.includes('what is') || q.includes('explain') || q.includes('definition') ||
      q.includes('meaning') || q.includes('concept') || q.includes('theorem') ||
      q.includes('property') || q.includes('why is')) {
    return QUESTION_CATEGORIES.GENERAL_CONCEPT;
  }
  
  // Priority 9: Basic arithmetic
  if (q.match(/\d+\s*[+\-*/]\s*\d+/) || q.includes('multiply') || q.includes('divide') ||
      q.includes('add') || q.includes('subtract') || q.includes('percentage') ||
      q.includes('square of') || q.includes('cube of')) {
    return QUESTION_CATEGORIES.ARITHMETIC;
  }
  
  // Default: miscellaneous
  return QUESTION_CATEGORIES.MISCELLANEOUS;
};

/**
 * DEPRECATED: Kept for backwards compatibility only
 * Use classifyQuestion() instead
 */
const getClassificationPrompt = (question) => {
  console.warn('[DEPRECATED] getClassificationPrompt called - use classifyQuestion instead');
  return '';
};

const parseClassificationResponse = (response) => {
  console.warn('[DEPRECATED] parseClassificationResponse called - use classifyQuestion instead');
  return QUESTION_CATEGORIES.MISCELLANEOUS;
};

module.exports = {
  QUESTION_CATEGORIES,
  classifyQuestion, // NEW: Rule-based classifier
  getClassificationPrompt, // DEPRECATED
  parseClassificationResponse // DEPRECATED
};
