/**
 * OPTIMIZED TEMPLATE ENGINE
 * Token-efficient prompts (40-60% reduction)
 */

const { QUESTION_CATEGORIES } = require('./questionClassifier');

// OPTIMIZATION 1: Concise section headers
const COMPACT_SECTIONS = {
  en: {
    concept: '## Concept',
    steps: '## Steps',
    vedic: '## Vedic Method',
    modern: '## Modern Method',
    formula: '## Formula',
    proof: '## Proof',
    example: '## Example',
    why: '## Why It Works'
  }
};

// OPTIMIZATION 2: Template compression (remove verbose instructions)
const getOptimizedPrompt = (category, question, language, vedicMapping = null) => {
  const lang = language === 'Hindi' ? 'hi' : 'en';
  const headers = COMPACT_SECTIONS[lang] || COMPACT_SECTIONS.en;
  
  // Core instruction (shared across all templates)
  const coreInstruction = `Answer: "${question}"\nLanguage: ${language}\nFormat: Markdown with sections below.`;
  
  if (vedicMapping) {
    return getCompactVedicTemplate(question, vedicMapping, headers, language);
  }
  
  // Category-specific compact templates
  switch (category) {
    case QUESTION_CATEGORIES.VEDIC_COMPUTATIONAL:
    case 'vedic':
      return `${coreInstruction}

${headers.concept}
[1 line: what we're solving]

${headers.vedic}
Sutra: [Sanskrit name]
Steps:
1. [calculation]
2. [result]
Answer: [final]

${headers.modern}
1. [standard method]
Answer: [verify same result]

${headers.why}
[2-3 lines why Vedic is faster]`;

    case QUESTION_CATEGORIES.ARITHMETIC:
    case QUESTION_CATEGORIES.ALGEBRA:
    case 'math':
      return `${coreInstruction}

${headers.concept}
[1 line problem type]

${headers.steps}
1. [step with calculation]
2. [next step]
3. [final result]

${headers.formula}
[if applicable, state formula used]

${headers.proof}
[if needed, brief verification]`;

    case QUESTION_CATEGORIES.GENERAL_CONCEPT:
    case 'concept':
    case 'theory':
      return `${coreInstruction}

${headers.concept}
[2-3 line explanation]

${headers.formula}
[mathematical representation]

${headers.example}
[1 concrete example with numbers]

${headers.why}
[1-2 lines practical use]`;

    default:
      return `${coreInstruction}

## Answer
[Provide clear, concise answer]

## Explanation
[2-3 key points]

## Example
[If relevant, brief example]`;
  }
};

// OPTIMIZATION 3: Ultra-compact Vedic cross-domain template (was 1800 tokens, now ~600)
const getCompactVedicTemplate = (question, mapping, headers, language) => {
  return `Answer: "${question}"
Lang: ${language}

${headers.vedic}
**Sutra**: ${mapping.short_name || mapping.conceptKey}
**Sanskrit**: ${mapping.sanskrit_meaning || '[name]'}

${headers.modern}
Equivalent: ${mapping.modern_equivalent || '[modern concept]'}
Field: ${mapping.mathematical_field || '[math branch]'}
Formula: ${mapping.modern_formula || '[formula]'}

${headers.proof}
${mapping.step_by_step_equivalence ? mapping.step_by_step_equivalence.slice(0, 3).join('\n') : '[Show equivalence in 2-3 steps]'}

${headers.example}
[Solve using BOTH methods, show same result]

${headers.why}
Confidence: ${mapping.confidence_score ? `${(mapping.confidence_score * 100).toFixed(0)}%` : 'TBD'}
Use: ${mapping.practical_applications?.[0] || '[main application]'}
Connection: ${Object.keys(mapping.cross_domain_connections || {})[0] || '[related field]'}

Format: Clear sections. No fluff.`;
};

module.exports = {
  getOptimizedPrompt,
  getTemplatePrompt: getOptimizedPrompt, // Alias for drop-in replacement
  COMPACT_SECTIONS
};
