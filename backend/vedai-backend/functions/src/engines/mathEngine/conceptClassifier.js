/**
 * Layer 1: Concept Recognition Engine
 * Classifies mathematical questions into specific domains
 */

const MATH_DOMAINS = {
  ALGEBRA: 'algebra',
  GEOMETRY: 'geometry',
  CALCULUS: 'calculus',
  TRIGONOMETRY: 'trigonometry',
  NUMBER_THEORY: 'number_theory',
  PROBABILITY: 'probability',
  STATISTICS: 'statistics',
  LINEAR_ALGEBRA: 'linear_algebra',
  DISCRETE_MATH: 'discrete_math',
  VEDIC_MATH: 'vedic_math',
  OLYMPIAD: 'olympiad'
};

const CONCEPT_PATTERNS = {
  // Algebra
  algebra: [
    /solve.*equation/i,
    /quadratic/i,
    /polynomial/i,
    /factor/i,
    /simplif/i,
    /expand/i,
    /linear.*system/i,
    /inequality/i
  ],
  
  // Calculus
  calculus: [
    /derivative/i,
    /integral/i,
    /limit/i,
    /differential/i,
    /dy\/dx/i,
    /∫/,
    /∂/,
    /gradient/i,
    /maxima|minima/i
  ],
  
  // Geometry
  geometry: [
    /triangle/i,
    /circle/i,
    /area/i,
    /perimeter/i,
    /volume/i,
    /angle/i,
    /pythagor/i,
    /coordinate/i,
    /distance.*point/i
  ],
  
  // Trigonometry
  trigonometry: [
    /sin|cos|tan/i,
    /trigonometric/i,
    /radian|degree/i,
    /sec|csc|cot/i,
    /inverse.*trig/i
  ],
  
  // Number Theory
  number_theory: [
    /prime/i,
    /factor.*\d+/i,
    /gcd|lcm/i,
    /divisib/i,
    /modulo|mod\s/i,
    /congruence/i,
    /euler/i
  ],
  
  // Probability
  probability: [
    /probability/i,
    /chance/i,
    /likelihood/i,
    /random/i,
    /dice|coin/i,
    /permutation/i,
    /combination/i
  ],
  
  // Statistics
  statistics: [
    /mean|average/i,
    /median/i,
    /mode/i,
    /standard deviation/i,
    /variance/i,
    /correlation/i,
    /regression/i,
    /distribution/i
  ],
  
  // Linear Algebra
  linear_algebra: [
    /matrix|matrices/i,
    /determinant/i,
    /eigenvalue/i,
    /vector/i,
    /dot.*product/i,
    /cross.*product/i,
    /rank/i,
    /transpose/i
  ],
  
  // Discrete Math
  discrete_math: [
    /graph.*theory/i,
    /tree/i,
    /path.*graph/i,
    /combinatorics/i,
    /recurrence/i,
    /sequence/i,
    /series/i,
    /fibonacci/i
  ],
  
  // Vedic Math (special patterns)
  vedic_math: [
    /vedic/i,
    /mental.*math/i,
    /fast.*multiply/i,
    /square.*\d+$/i,
    /cube.*\d+$/i,
    /ekadhikena/i,
    /nikhilam/i,
    /urdhva.*tiryak/i
  ],
  
  // Olympiad
  olympiad: [
    /olympiad/i,
    /prove/i,
    /show.*that/i,
    /find.*all/i,
    /imo|aime|usamo/i
  ]
};

/**
 * Extract numbers from question
 */
function extractNumbers(question) {
  const numbers = [];
  const regex = /-?\d+\.?\d*/g;
  let match;
  while ((match = regex.exec(question)) !== null) {
    numbers.push(parseFloat(match[0]));
  }
  return numbers;
}

/**
 * Detect special Vedic patterns
 */
function detectVedicPattern(question) {
  const numbers = extractNumbers(question);
  
  // Square detection
  if (/square.*of/i.test(question) && numbers.length === 1) {
    return { type: 'square', number: numbers[0] };
  }
  
  // Cube detection
  if (/cube.*of/i.test(question) && numbers.length === 1) {
    return { type: 'cube', number: numbers[0] };
  }
  
  // Multiplication detection
  if (/multiply|product/i.test(question) && numbers.length === 2) {
    return { type: 'multiply', numbers: numbers };
  }
  
  return null;
}

/**
 * Main concept classifier
 */
function classifyMathConcept(question) {
  const normalizedQuestion = question.toLowerCase().trim();
  const scores = {};
  
  // Calculate match scores for each domain
  for (const [domain, patterns] of Object.entries(CONCEPT_PATTERNS)) {
    let matchCount = 0;
    for (const pattern of patterns) {
      if (pattern.test(normalizedQuestion)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      scores[domain] = matchCount;
    }
  }
  
  // Find best match
  const sortedDomains = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]);
  
  const primaryDomain = sortedDomains.length > 0 
    ? sortedDomains[0][0] 
    : 'algebra'; // default
  
  const confidence = sortedDomains.length > 0 
    ? Math.min(sortedDomains[0][1] * 0.3, 0.95) 
    : 0.3;
  
  // Detect special patterns
  const vedicPattern = detectVedicPattern(question);
  const numbers = extractNumbers(question);
  
  return {
    primaryDomain,
    allDomains: sortedDomains.map(([d, s]) => d),
    confidence,
    vedicPattern,
    numbers,
    isComputation: numbers.length > 0,
    isProof: /prove|show.*that|demonstrate/i.test(normalizedQuestion)
  };
}

module.exports = {
  MATH_DOMAINS,
  classifyMathConcept,
  extractNumbers,
  detectVedicPattern
};
