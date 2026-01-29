/**
 * CONCEPT-ONLY AI BYPASS
 * Instant responses for pure theory questions (no AI needed)
 */

// Knowledge base for common conceptual questions
const CONCEPT_KNOWLEDGE = {
  // Vedic sutras
  'nikhilam': {
    sanskrit: 'Nikhilam Navatashcaramam Dashatah',
    meaning: 'All from 9 and last from 10',
    modernEquivalent: 'Complement Arithmetic & Base Subtraction',
    field: 'Algebra',
    formula: '(a-b)(c-d) = ac - ad - bc + bd',
    use: 'Fast multiplication near powers of 10',
    example: '98 × 97 = (100-2)(100-3) = 9506'
  },
  'ekadhikena': {
    sanskrit: 'Ekadhikena Purvena',
    meaning: 'By one more than the previous one',
    modernEquivalent: 'Sequential squaring identity',
    field: 'Algebra',
    formula: '(10a + 5)² = a(a+1)100 + 25',
    use: 'Quick squaring of numbers ending in 5',
    example: '45² = 4×5 hundreds + 25 = 2025'
  },
  'urdhva': {
    sanskrit: 'Urdhva-Tiryagbhyam',
    meaning: 'Vertically and crosswise',
    modernEquivalent: 'Distributive multiplication (FOIL)',
    field: 'Algebra',
    formula: '(a+b)(c+d) = ac + ad + bc + bd',
    use: 'General multiplication algorithm',
    example: '23 × 41 = (2×4)100 + (2×1+3×4)10 + (3×1) = 943'
  },
  'vertically': {
    sanskrit: 'Urdhva-Tiryagbhyam',
    meaning: 'Vertically and crosswise',
    modernEquivalent: 'Distributive multiplication',
    field: 'Algebra',
    formula: 'See urdhva',
    use: 'Multiplication',
    example: 'See urdhva'
  }
};

// Math concepts
const MATH_CONCEPTS = {
  'pythagoras': {
    name: 'Pythagorean Theorem',
    formula: 'a² + b² = c²',
    field: 'Geometry',
    meaning: 'In right triangle, sum of squares of sides equals square of hypotenuse',
    proof: 'Area-based proof or algebraic proof',
    use: 'Distance calculation, right triangle problems'
  },
  'quadratic': {
    name: 'Quadratic Formula',
    formula: 'x = (-b ± √(b²-4ac)) / 2a',
    field: 'Algebra',
    meaning: 'Solves ax² + bx + c = 0',
    derivation: 'Completing the square method',
    use: 'Solving second-degree polynomial equations'
  },
  'sine': {
    name: 'Sine Function',
    formula: 'sin(θ) = opposite/hypotenuse',
    field: 'Trigonometry',
    meaning: 'Ratio of opposite side to hypotenuse in right triangle',
    range: '[-1, 1]',
    use: 'Wave modeling, periodic phenomena'
  }
};

/**
 * Check if question is pure theory (no AI needed)
 */
function isPureTheoryQuestion(question) {
  const lowerQ = question.toLowerCase();
  
  // Theory question indicators
  const theoryKeywords = [
    'what is',
    'define',
    'explain',
    'meaning of',
    'sanskrit name',
    'formula for',
    'theorem',
    'principle',
    'sutra'
  ];
  
  // Computation indicators (needs AI)
  const computationKeywords = [
    'calculate',
    'solve',
    'find value',
    'compute',
    'result',
    'answer'
  ];
  
  const hasTheory = theoryKeywords.some(kw => lowerQ.includes(kw));
  const hasComputation = computationKeywords.some(kw => lowerQ.includes(kw));
  
  return hasTheory && !hasComputation;
}

/**
 * Extract concept key from question
 */
function extractConceptKey(question) {
  const lowerQ = question.toLowerCase();
  
  // Check Vedic concepts
  for (const [key, data] of Object.entries(CONCEPT_KNOWLEDGE)) {
    if (lowerQ.includes(key) || lowerQ.includes(data.sanskrit.toLowerCase())) {
      return { type: 'vedic', key, data };
    }
  }
  
  // Check math concepts
  for (const [key, data] of Object.entries(MATH_CONCEPTS)) {
    if (lowerQ.includes(key) || lowerQ.includes(data.name.toLowerCase())) {
      return { type: 'math', key, data };
    }
  }
  
  return null;
}

/**
 * Generate instant response (no AI call)
 */
function generateConceptResponse(conceptInfo, question, language = 'English') {
  if (!conceptInfo) return null;
  
  const { type, data } = conceptInfo;
  
  if (type === 'vedic') {
    return `## Vedic Sutra: ${data.sanskrit}

**Meaning**: ${data.meaning}

**Modern Scientific Equivalent**: ${data.modernEquivalent}

**Mathematical Field**: ${data.field}

**Formula**: 
\`\`\`
${data.formula}
\`\`\`

**Practical Use**: ${data.use}

**Example**:
${data.example}

**Why It Works**: This Vedic method is mathematically equivalent to ${data.modernEquivalent}. The sutra provides a shortcut by recognizing patterns that the standard method computes explicitly.

---
*Response from knowledge base (no AI generation needed)*`;
  }
  
  if (type === 'math') {
    return `## ${data.name}

**Formula**: 
\`\`\`
${data.formula}
\`\`\`

**Field**: ${data.field}

**Explanation**: ${data.meaning}

${data.derivation ? `**Derivation**: ${data.derivation}` : ''}
${data.proof ? `**Proof**: ${data.proof}` : ''}
${data.range ? `**Range**: ${data.range}` : ''}

**Applications**: ${data.use}

---
*Response from knowledge base (instant retrieval)*`;
  }
  
  return null;
}

/**
 * Main bypass function
 */
function tryConceptBypass(question, language = 'English') {
  // Check if pure theory
  if (!isPureTheoryQuestion(question)) {
    return null; // Needs computation, use AI
  }
  
  // Extract concept
  const conceptInfo = extractConceptKey(question);
  if (!conceptInfo) {
    return null; // Unknown concept, use AI
  }
  
  // Generate instant response
  const response = generateConceptResponse(conceptInfo, question, language);
  
  if (response) {
    console.log('[BYPASS] Concept-only response generated (0ms, no AI call)');
    return {
      answer: response,
      questionType: 'concept',
      cached: false,
      bypassUsed: true,
      processingTime: 0,
      tokenCount: 0,
      sections: { concept: response }
    };
  }
  
  return null;
}

module.exports = {
  tryConceptBypass,
  isPureTheoryQuestion,
  CONCEPT_KNOWLEDGE,
  MATH_CONCEPTS
};
