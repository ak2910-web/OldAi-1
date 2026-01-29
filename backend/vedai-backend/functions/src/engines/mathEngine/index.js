/**
 * VedAI Mathematical Intelligence Engine
 * Unified entry point for mathematical problem solving
 */

const { classifyMathConcept, extractNumbers, detectVedicPattern } = require('./conceptClassifier');
const symbolicSolver = require('./symbolicSolver');
const vedicSolver = require('./vedicSolver');
const numericalSolver = require('./numericalSolver');

/**
 * Main Mathematical Intelligence Engine
 * Routes problems to appropriate solvers
 */
async function solveMathProblem(question, options = {}) {
  const startTime = Date.now();
  
  // Layer 1: Classify the concept
  const classification = classifyMathConcept(question);
  
  console.log('[MATH-ENGINE] Classification:', classification);
  
  // Initialize result object
  const result = {
    question: question,
    classification: classification,
    solution: null,
    explanation: null,
    method: null,
    confidence: classification.confidence,
    processingTime: 0
  };
  
  try {
    // Layer 2-5: Route to appropriate solver based on classification
    
    // Priority 1: Vedic Math (if applicable)
    if (classification.vedicPattern) {
      console.log('[MATH-ENGINE] Using Vedic Solver');
      
      const { type, number, numbers } = classification.vedicPattern;
      
      switch (type) {
        case 'square':
          result.solution = vedicSolver.vedicSquare(number);
          result.method = 'vedic_math';
          break;
        case 'cube':
          result.solution = vedicSolver.vedicCube(number);
          result.method = 'vedic_math';
          break;
        case 'multiply':
          result.solution = vedicSolver.vedicMultiply(numbers[0], numbers[1]);
          result.method = 'vedic_math';
          break;
      }
    }
    
    // Priority 2: Symbolic computation (for algebra, calculus)
    else if (['algebra', 'calculus'].includes(classification.primaryDomain)) {
      console.log('[MATH-ENGINE] Using Symbolic Solver');
      
      // Check for equation solving
      if (question.includes('=') && !question.includes('==')) {
        result.solution = symbolicSolver.solveAlgebraicEquation(
          question.split('solve')[1]?.trim() || question,
          'x'
        );
        result.method = 'symbolic_algebra';
      }
      // Check for derivative
      else if (/derivative|differentiate/i.test(question)) {
        const expr = extractExpression(question);
        result.solution = symbolicSolver.calculateDerivative(expr);
        result.method = 'symbolic_calculus';
      }
      // Check for simplification
      else if (/simplify/i.test(question)) {
        const expr = extractExpression(question);
        result.solution = symbolicSolver.simplifyExpression(expr);
        result.method = 'symbolic_simplification';
      }
    }
    
    // Priority 3: Numerical methods (for approximations)
    else if (['calculus', 'probability'].includes(classification.primaryDomain) && 
             /approximate|integrate|numerical/i.test(question)) {
      console.log('[MATH-ENGINE] Using Numerical Solver');
      
      // This would require parsing function definition from question
      // For now, return indication that numerical methods are available
      result.solution = {
        success: true,
        note: 'Numerical methods available for integration, root finding, ODEs',
        availableMethods: [
          'Newton-Raphson',
          'Bisection',
          "Simpson's Rule",
          'Trapezoidal Rule',
          "Euler's Method"
        ]
      };
      result.method = 'numerical_analysis';
    }
    
    // Priority 4: Specialized domains
    else {
      console.log('[MATH-ENGINE] Domain-specific solver required');
      result.solution = {
        success: true,
        domain: classification.primaryDomain,
        note: 'Specialized solver for this domain',
        requiresAI: true // Will use LLM for explanation
      };
      result.method = 'specialized';
    }
    
    result.processingTime = Date.now() - startTime;
    
    return result;
    
  } catch (error) {
    console.error('[MATH-ENGINE] Error:', error);
    result.error = error.message;
    result.processingTime = Date.now() - startTime;
    return result;
  }
}

/**
 * Extract mathematical expression from natural language
 */
function extractExpression(question) {
  // Simple extraction - in production, use more sophisticated parsing
  const mathPatterns = [
    /(?:of |: )([x\d\+\-\*/\^\(\) ]+)/i,
    /\b([x\d\+\-\*/\^\(\) ]{3,})\b/i
  ];
  
  for (const pattern of mathPatterns) {
    const match = question.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return question;
}

/**
 * Generate explanation using the solution
 */
function generateExplanation(solution, classification) {
  if (!solution) return null;
  
  const parts = [];
  
  // Add method explanation
  if (solution.method) {
    parts.push(`**Method Used:** ${solution.method.replace(/_/g, ' ').toUpperCase()}`);
  }
  
  // Add steps if available
  if (solution.steps && solution.steps.length > 0) {
    parts.push('\n**Step-by-Step Solution:**');
    solution.steps.forEach((step, i) => {
      parts.push(`${i + 1}. ${step}`);
    });
  }
  
  // Add result
  if (solution.result !== undefined) {
    parts.push(`\n**Answer:** ${solution.result}`);
  } else if (solution.solutions) {
    if (Array.isArray(solution.solutions)) {
      parts.push(`\n**Solutions:** x = ${solution.solutions.join(', ')}`);
    } else {
      parts.push(`\n**Solutions:** ${solution.solutions}`);
    }
  }
  
  // Add verification
  if (solution.verified !== undefined) {
    parts.push(`\n✓ Solution verified: ${solution.verified ? 'Correct' : 'Check required'}`);
  }
  
  return parts.join('\n');
}

module.exports = {
  solveMathProblem,
  generateExplanation,
  classifyMathConcept,
  symbolicSolver,
  vedicSolver,
  numericalSolver
};
