/**
 * TEMPLATE LAYER
 * Generates dynamic prompts based on question category
 */

const { QUESTION_CATEGORIES } = require('./questionClassifier');

/**
 * Get template prompt based on question category
 * @param {string} category - Question category
 * @param {string} question - Original question
 * @param {string} language - Response language
 * @param {object} vedicMapping - Optional Vedic-Modern mapping data
 * @returns {string} - Templated prompt
 */
const getTemplatePrompt = (category, question, language, vedicMapping = null) => {
  const languageInstruction = getLanguageInstruction(language);
  const sectionHeaders = getSectionHeaders(language);
  
  // If Vedic mapping is provided, use cross-domain template
  if (vedicMapping) {
    return getCrossDomainInferenceTemplate(question, vedicMapping, sectionHeaders, languageInstruction);
  }
  
  switch (category) {
    case QUESTION_CATEGORIES.VEDIC_COMPUTATIONAL:
      return getVedicComputationalTemplate(question, sectionHeaders, languageInstruction);
    
    case QUESTION_CATEGORIES.ARITHMETIC:
      return getArithmeticTemplate(question, sectionHeaders, languageInstruction);
    
    case QUESTION_CATEGORIES.ALGEBRA:
      return getAlgebraTemplate(question, sectionHeaders, languageInstruction);
    
    case QUESTION_CATEGORIES.GEOMETRY:
      return getGeometryTemplate(question, sectionHeaders, languageInstruction);
    
    case QUESTION_CATEGORIES.TRIGONOMETRY:
      return getTrigonometryTemplate(question, sectionHeaders, languageInstruction);
    
    case QUESTION_CATEGORIES.FORMULA_DERIVATION:
      return getFormulaTemplate(question, sectionHeaders, languageInstruction);
    
    case QUESTION_CATEGORIES.GENERAL_CONCEPT:
      return getConceptTemplate(question, sectionHeaders, languageInstruction);
    
    case QUESTION_CATEGORIES.WORD_PROBLEM:
      return getWordProblemTemplate(question, sectionHeaders, languageInstruction);
    
    case QUESTION_CATEGORIES.HISTORY_CULTURE:
      return getHistoryTemplate(question, sectionHeaders, languageInstruction);
    
    case QUESTION_CATEGORIES.MISCELLANEOUS:
    default:
      return getFreeFormTemplate(question, sectionHeaders, languageInstruction);
  }
};

/**
 * NEW: CROSS-DOMAIN INFERENCE TEMPLATE
 * Patent-worthy innovation: Maps Vedic concepts to modern frameworks
 */
const getCrossDomainInferenceTemplate = (question, vedicMapping, headers, langInstruction) => {
  const mapping = vedicMapping;
  
  return `You are VedAI, an advanced system that bridges ancient Vedic mathematical wisdom with modern scientific frameworks.

Question: ${question}

I have identified this relates to the Vedic concept: "${mapping.short_name || mapping.conceptKey}"

Your task is to provide a comprehensive cross-domain analysis that demonstrates the connection between ancient Vedic mathematics and modern science.

Structure your response EXACTLY as follows:

**${headers.vedicPrinciple || 'Vedic Principle'}:**
${mapping.sanskrit_meaning || '[Explain the original Vedic concept]'}

**${headers.sanskritName || 'Sanskrit Name'}:**
${mapping.english_translation || '[Provide Sanskrit name and translation]'}

**${headers.modernEquivalent || 'Modern Scientific Equivalent'}:**
${mapping.modern_equivalent || '[Explain the equivalent modern concept/method]'}

**${headers.mathematicalField || 'Mathematical Field'}:**
${mapping.mathematical_field || '[Identify which branch of modern mathematics]'}

**${headers.formulaEquivalence || 'Formula/Algorithm Equivalence'}:**
Modern: ${mapping.modern_formula || '[State modern formula]'}
Vedic: [Express the Vedic method in mathematical notation]

**${headers.stepByStepProof || 'Step-by-Step Equivalence Proof'}:**
${mapping.step_by_step_equivalence ? mapping.step_by_step_equivalence.map((step, i) => `${i + 1}. ${step}`).join('\n') : '• [Demonstrate step-by-step why these are mathematically equivalent]'}

**${headers.practicalApplications || 'Real-World Applications'}:**
${mapping.practical_applications ? mapping.practical_applications.map((app, i) => `${i + 1}. ${app}`).join('\n') : '• [List modern applications where this principle is used]'}

**${headers.crossDomainConnections || 'Cross-Domain Connections'}:**
${mapping.cross_domain_connections ? Object.entries(mapping.cross_domain_connections).map(([field, conn]) => `• **${field.toUpperCase()}**: ${conn}`).join('\n') : '• [Identify connections to physics, computer science, engineering, etc.]'}

**${headers.confidenceScore || 'Mapping Confidence'}:**
${mapping.confidence_score ? `${(mapping.confidence_score * 100).toFixed(0)}%` : '[0-100%]'} - [Explain why this confidence level]

**${headers.historicalContext || 'Historical Context'}:**
Ancient Source: ${mapping.sources?.ancient || '[Cite Vedic text reference]'}
Modern Source: ${mapping.sources?.modern || '[Cite modern mathematical reference]'}

**${headers.whyItMatters || 'Why This Connection Matters'}:**
[Explain the significance of this Vedic-Modern bridge and how it advances our understanding]

**${headers.workedExample || 'Worked Example'}:**
[Solve the original question using BOTH Vedic and modern methods to demonstrate equivalence]

${langInstruction}

CRITICAL: Your response must be factually accurate, cite real sources, and clearly demonstrate the mathematical equivalence between the Vedic and modern approaches. Do not overstate connections - be precise and scientific.`;
};

/**
 * TEMPLATE 1: Vedic Computational
 */
const getVedicComputationalTemplate = (question, headers, langInstruction) => {
  return `You are a Vedic mathematics expert. Answer this computational question using Vedic methods.

Question: ${question}

Structure your response EXACTLY as follows:

**${headers.concept || 'Concept'}:**
[One line: What we're solving]

**${headers.vedicSutra || 'Vedic Sutra'}:**
[Sanskrit name + transliteration]

**${headers.sanskritMeaning || 'Sanskrit Meaning'}:**
[Short meaning in 1 line]

**${headers.vedicSteps || 'Steps (Vedic Method)'}:**
• [Concise step with calculation]
• [Next step with result]
• [Continue - max 4-5 steps]
• **Answer: [Result]**

**${headers.modernMethod || 'Modern Method'}:**
• [Standard approach step]
• [Calculation]
• **Answer: [Result]**

**${headers.comparison || 'Comparison'}:**
| Feature | Modern Method | Vedic Method |
|---------|--------------|--------------|
| Steps | [X] steps | [Y] steps |
| Time | Baseline | [Z]% faster |
| Mental Calculation | [Harder/Easier] | [Easier/Harder] |

**${headers.finalAnswer || 'Final Answer'}:**
[Clear final answer with units if applicable]

${langInstruction}`;
};

/**
 * TEMPLATE 2: Arithmetic (Non-Vedic)
 */
const getArithmeticTemplate = (question, headers, langInstruction) => {
  return `Answer this arithmetic question clearly and systematically.

Question: ${question}

Structure your response EXACTLY as follows:

**${headers.concept || 'Concept'}:**
[One line concept]

**${headers.formula || 'Formula'}:**
[Formula only]

**${headers.steps || 'Steps'}:**
• [Brief step + calc]
• [Next step]
• [Max 3-4 steps]

**${headers.finalAnswer || 'Final Answer'}:**
[Clear final answer]

**${headers.example || 'Example'}:**
[Provide one similar example with solution]

${langInstruction}`;
};

/**
 * TEMPLATE 3: Algebra
 */
const getAlgebraTemplate = (question, headers, langInstruction) => {
  return `Solve this algebraic problem step by step.

Question: ${question}

Structure your response EXACTLY as follows:

**${headers.concept || 'Concept'}:**
[What algebraic concept is involved]

**${headers.stepsToSolve || 'Steps to Solve'}:**
• Step 1: [First transformation or operation]
• Step 2: [Next step with reasoning]
• Step 3: [Continue solving]

**${headers.simplification || 'Simplification'}:**
[Show the simplified form]

**${headers.finalAnswer || 'Final Answer'}:**
[Solution (e.g., x = 5)]

**${headers.graphicalMeaning || 'Graphical Meaning (if applicable)'}:**
[Explain what this means graphically, if relevant]

${langInstruction}`;
};

/**
 * TEMPLATE 4: Geometry
 */
const getGeometryTemplate = (question, headers, langInstruction) => {
  return `Solve this geometry problem with clear explanations.

Question: ${question}

Structure your response EXACTLY as follows:

**${headers.concept || 'Concept'}:**
[What geometric concept or shape is involved]

**${headers.formula || 'Formula'}:**
[Geometric formula needed]

**${headers.diagram || 'Diagram (ASCII)'}:**
[Simple text-based diagram if helpful, or describe the figure]

**${headers.steps || 'Steps'}:**
• Step 1: [Identify given information]
• Step 2: [Apply formula or theorem]
• Step 3: [Calculate]

**${headers.finalAnswer || 'Final Answer'}:**
[Result with units]

**${headers.realWorldApplications || 'Real-World Applications'}:**
• [Where this geometry is used in real life]

${langInstruction}`;
};

/**
 * TEMPLATE 5: Trigonometry
 */
const getTrigonometryTemplate = (question, headers, langInstruction) => {
  return `Solve this trigonometry problem clearly.

Question: ${question}

Structure your response EXACTLY as follows:

**${headers.concept || 'Concept'}:**
[What trigonometric concept is used]

**${headers.formulaIdentity || 'Formula/Identity'}:**
[Relevant trigonometric formula or identity]

**${headers.explanation || 'Explanation'}:**
[Brief explanation of the formula and when to use it]

**${headers.example || 'Example'}:**
• Step 1: [Apply the formula]
• Step 2: [Calculate]
• Step 3: [Simplify]

**${headers.finalAnswer || 'Final Answer'}:**
[Result]

${langInstruction}`;
};

/**
 * TEMPLATE 6: Formula Derivation
 */
const getFormulaTemplate = (question, headers, langInstruction) => {
  return `Derive or explain this mathematical formula.

Question: ${question}

Structure your response EXACTLY as follows:

**${headers.formula || 'Formula'}:**
[State the formula clearly]

**${headers.derivationSteps || 'Derivation Steps'}:**
• Step 1: [Start with basic principles]
• Step 2: [Show transformations]
• Step 3: [Continue logical steps]
• Final Form: [Derived formula]

**${headers.proofOrJustification || 'Proof/Justification'}:**
[Why this formula is correct]

**${headers.applications || 'Applications'}:**
• [Where this formula is used]

${langInstruction}`;
};

/**
 * TEMPLATE 7: General Concept/Theory
 */
const getConceptTemplate = (question, headers, langInstruction) => {
  return `Explain this mathematical concept clearly.

Question: ${question}

Structure your response EXACTLY as follows:

**${headers.definition || 'Definition'}:**
[Clear definition of the concept]

**${headers.explanation || 'Explanation'}:**
[2-3 bullet points max, each 1 line]

**${headers.example || 'Example'}:**
[Provide a concrete example demonstrating the concept]

**${headers.application || 'Application'}:**
• [How this concept is used in mathematics]
• [Real-world applications]

${langInstruction}`;
};

/**
 * TEMPLATE 8: Word Problem
 */
const getWordProblemTemplate = (question, headers, langInstruction) => {
  return `Solve this word problem systematically.

Question: ${question}

Structure your response EXACTLY as follows:

**${headers.given || 'Given'}:**
• [List all given information from the problem]

**${headers.toFind || 'To Find'}:**
• [What needs to be calculated or determined]

**${headers.approach || 'Approach'}:**
[Explain the strategy to solve this problem]

**${headers.steps || 'Steps'}:**
• Step 1: [Set up equations or relationships]
• Step 2: [Perform calculations]
• Step 3: [Continue solving]

**${headers.finalAnswer || 'Final Answer'}:**
[Answer in context of the problem with units]

${langInstruction}`;
};

/**
 * TEMPLATE 9: Vedic History/Culture
 */
const getHistoryTemplate = (question, headers, langInstruction) => {
  return `Explain the historical and cultural context of this mathematical topic.

Question: ${question}

Structure your response EXACTLY as follows:

**${headers.origin || 'Origin'}:**
[When and where this concept originated]

**${headers.meaning || 'Meaning'}:**
[What the Sanskrit term means and its significance]

**${headers.usage || 'Usage'}:**
[How it was used in ancient times]

**${headers.example || 'Example'}:**
[Provide a historical or practical example]

**${headers.culturalSignificance || 'Cultural Significance'}:**
[Why this was important in Vedic culture and mathematics]

${langInstruction}`;
};

/**
 * TEMPLATE 10: Free-Form (Fallback)
 */
const getFreeFormTemplate = (question, headers, langInstruction) => {
  return `Answer this mathematical question clearly and comprehensively.

Question: ${question}

Structure your response with clear sections:

**${headers.explanation || 'Explanation'}:**
[Provide a clear, comprehensive explanation]

**${headers.keyPoints || 'Key Points'}:**
• [Important point 1]
• [Important point 2]
• [Important point 3]

**${headers.example || 'Example (if applicable)'}:**
[Provide an example if relevant]

${langInstruction}`;
};

/**
 * Get language-specific instructions
 */
const getLanguageInstruction = (language) => {
  if (language === 'Hindi') {
    return '\n\nCRITICAL: Write ENTIRE response in Hindi (Devanagari script). ALL headings, explanations, examples MUST be in Hindi. Only mathematical formulas and numbers remain in standard notation.';
  } else if (language === 'Sanskrit') {
    return '\n\nCRITICAL: Write ENTIRE response in Sanskrit (Devanagari script). Use pure Sanskrit terminology. Only mathematical formulas remain in standard notation.';
  }
  return '\n\nWrite in English. Use clear mathematical notation with _{} for subscripts and ^{} for superscripts.';
};

/**
 * Get section headers based on language
 */
const getSectionHeaders = (language) => {
  if (language === 'Hindi') {
    return {
      concept: 'अवधारणा',
      vedicSutra: 'वैदिक सूत्र',
      sanskritMeaning: 'संस्कृत अर्थ',
      vedicSteps: 'वैदिक विधि के चरण',
      modernMethod: 'आधुनिक विधि',
      comparison: 'तुलना',
      finalAnswer: 'अंतिम उत्तर',
      formula: 'सूत्र',
      steps: 'चरण',
      example: 'उदाहरण',
      stepsToSolve: 'हल करने के चरण',
      simplification: 'सरलीकरण',
      graphicalMeaning: 'ग्राफीय अर्थ',
      diagram: 'आरेख',
      realWorldApplications: 'वास्तविक जीवन में उपयोग',
      formulaIdentity: 'सूत्र/सर्वसमिका',
      explanation: 'व्याख्या',
      derivationSteps: 'व्युत्पत्ति चरण',
      proofOrJustification: 'प्रमाण',
      applications: 'अनुप्रयोग',
      definition: 'परिभाषा',
      application: 'उपयोग',
      given: 'दिया गया',
      toFind: 'ज्ञात करना है',
      approach: 'विधि',
      origin: 'उत्पत्ति',
      meaning: 'अर्थ',
      usage: 'प्रयोग',
      culturalSignificance: 'सांस्कृतिक महत्व',
      keyPoints: 'मुख्य बिंदु'
    };
  } else if (language === 'Sanskrit') {
    return {
      concept: 'अवधारणा',
      vedicSutra: 'वैदिक सूत्रम्',
      sanskritMeaning: 'संस्कृत अर्थः',
      vedicSteps: 'वैदिक विधि चरणाः',
      modernMethod: 'आधुनिक विधिः',
      comparison: 'तुलना',
      finalAnswer: 'अन्तिम उत्तरम्',
      formula: 'सूत्रम्',
      steps: 'चरणाः',
      example: 'उदाहरणम्',
      stepsToSolve: 'समाधान चरणाः',
      simplification: 'सरलीकरणम्',
      graphicalMeaning: 'आलेख्य अर्थः',
      diagram: 'आरेखः',
      realWorldApplications: 'वास्तविक जीवने प्रयोगः',
      formulaIdentity: 'सूत्रम्/सर्वसमिका',
      explanation: 'व्याख्या',
      derivationSteps: 'व्युत्पत्ति चरणाः',
      proofOrJustification: 'प्रमाणम्',
      applications: 'अनुप्रयोगाः',
      definition: 'परिभाषा',
      application: 'प्रयोगः',
      given: 'दत्तम्',
      toFind: 'ज्ञातव्यम्',
      approach: 'विधिः',
      origin: 'उत्पत्तिः',
      meaning: 'अर्थः',
      usage: 'प्रयोगः',
      culturalSignificance: 'सांस्कृतिक महत्त्वम्',
      keyPoints: 'मुख्य बिन्दवः'
    };
  }
  // English (default)
  return {
    concept: 'Concept',
    vedicSutra: 'Vedic Sutra',
    sanskritMeaning: 'Sanskrit Meaning',
    vedicSteps: 'Steps (Vedic Method)',
    modernMethod: 'Modern Method',
    comparison: 'Comparison',
    finalAnswer: 'Final Answer',
    formula: 'Formula',
    steps: 'Steps',
    example: 'Example',
    stepsToSolve: 'Steps to Solve',
    simplification: 'Simplification',
    graphicalMeaning: 'Graphical Meaning',
    diagram: 'Diagram (ASCII)',
    realWorldApplications: 'Real-World Applications',
    formulaIdentity: 'Formula/Identity',
    explanation: 'Explanation',
    derivationSteps: 'Derivation Steps',
    proofOrJustification: 'Proof/Justification',
    applications: 'Applications',
    definition: 'Definition',
    application: 'Application',
    given: 'Given',
    toFind: 'To Find',
    approach: 'Approach',
    origin: 'Origin',
    meaning: 'Meaning',
    usage: 'Usage',
    culturalSignificance: 'Cultural Significance',
    keyPoints: 'Key Points'
  };
};

module.exports = {
  getTemplatePrompt,
  getCrossDomainInferenceTemplate,
  getSectionHeaders,
  getLanguageInstruction
};
