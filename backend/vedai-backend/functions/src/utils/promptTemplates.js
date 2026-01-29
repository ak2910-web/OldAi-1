/**
 * Prompt Templates
 * Centralized prompt generation for different question types
 */

/**
 * Get language-specific section headers
 */
function getSectionHeaders(language) {
  if (language === 'Hindi') {
    return {
      title: 'विषय',
      ancient: 'प्राचीन वैदिक दृष्टिकोण',
      sanskritName: 'संस्कृत नाम',
      history: 'ऐतिहासिक संदर्भ',
      vedicExplanation: 'वैदिक व्याख्या',
      formula: 'मूल सूत्र/विधि',
      example: 'वैदिक विधि का उदाहरण',
      modern: 'आधुनिक गणितीय दृष्टिकोण',
      modernName: 'आधुनिक नाम',
      discovery: 'पश्चिमी खोज',
      modernExplanation: 'आधुनिक व्याख्या',
      modernFormula: 'आधुनिक सूत्र/विधि',
      modernExample: 'आधुनिक विधि का उदाहरण',
      connection: 'संबंध',
      relate: 'वे कैसे संबंधित हैं',
      advantage: 'प्राचीन विधि क्यों जीतती है',
      cultural: 'सांस्कृतिक संदर्भ',
      comparison: 'दृश्य तुलना',
      steps: 'चरण',
      timeSaved: 'समय बचाया',
      applications: 'वास्तविक दुनिया के अनुप्रयोग'
    };
  } else if (language === 'Sanskrit') {
    return {
      title: 'विषयः',
      ancient: 'प्राचीन वैदिक दृष्टिः',
      sanskritName: 'संस्कृत नाम',
      history: 'ऐतिहासिक सन्दर्भः',
      vedicExplanation: 'वैदिक व्याख्या',
      formula: 'मूल सूत्रम्/विधिः',
      example: 'वैदिक विधि उदाहरणम्',
      modern: 'आधुनिक गणितीय दृष्टिः',
      modernName: 'आधुनिक नाम',
      discovery: 'पश्चिमी आविष्कारः',
      modernExplanation: 'आधुनिक व्याख्या',
      modernFormula: 'आधुनिक सूत्रम्/विधिः',
      modernExample: 'आधुनिक विधि उदाहरणम्',
      connection: 'सम्बन्धः',
      relate: 'ते कथं सम्बद्धाः',
      advantage: 'प्राचीन विधिः कथं विजयी',
      cultural: 'सांस्कृतिक सन्दर्भः',
      comparison: 'दृश्य तुलना',
      steps: 'चरणाः',
      timeSaved: 'समय बचितम्',
      applications: 'वास्तविक जगत् अनुप्रयोगाः'
    };
  } else {
    // English
    return {
      title: 'Main Topic',
      ancient: 'Ancient Vedic Perspective',
      sanskritName: 'Sanskrit Name',
      history: 'Historical Context',
      vedicExplanation: 'Vedic Explanation',
      formula: 'Original Formula/Method',
      example: 'Example Using Vedic Method',
      modern: 'Modern Mathematical Perspective',
      modernName: 'Modern Name',
      discovery: 'Western Discovery',
      modernExplanation: 'Modern Explanation',
      modernFormula: 'Modern Formula/Method',
      modernExample: 'Example Using Modern Method',
      connection: 'The Connection',
      relate: 'How They Relate',
      advantage: 'Why Ancient Method Often Wins',
      cultural: 'Cultural Context',
      comparison: 'Visual Comparison',
      steps: 'Steps',
      timeSaved: 'Time Saved',
      applications: 'Real-World Applications'
    };
  }
}

/**
 * Get language instruction
 */
function getLanguageInstruction(language) {
  if (language === 'Hindi') {
    return '\n\nCRITICAL: Write ENTIRE response in Hindi (Devanagari script). ALL headings, explanations, examples, and descriptions MUST be in Hindi. Only keep mathematical formulas and numbers in their standard form. Sanskrit terms should be in Devanagari. Do NOT use English words except for formulas.';
  } else if (language === 'Sanskrit') {
    return '\n\nCRITICAL: Write ENTIRE response in Sanskrit (Devanagari script). ALL headings, explanations, examples, and descriptions MUST be in Sanskrit. Only keep mathematical formulas in standard notation. Use pure Sanskrit terminology throughout. Do NOT use English or Hindi words except for formulas.';
  } else {
    return '\n\nWrite in English with Devanagari for Sanskrit terms (with transliteration in parentheses).';
  }
}

/**
 * Generate prompt for ancient vs modern comparison
 */
function generateAncientModernPrompt(question, language) {
  const headers = getSectionHeaders(language);
  const langInstruction = getLanguageInstruction(language);
  
  return `You are an expert in Vedic and Modern Mathematics. Provide a balanced mix of flowing descriptions and clear bullet points.

Structure your response EXACTLY as follows:

**[Write only the topic name here without any label]**

## ${headers.ancient}

### ${headers.sanskritName}: [Sanskrit term in Devanagari] ([Transliteration])

### ${headers.history}:
Write a flowing paragraph (2-3 sentences) about when and where this concept originated. Include dates, ancient texts, and key scholars.

### ${headers.vedicExplanation}:
Write a descriptive paragraph (3-4 sentences) explaining the ancient Vedic understanding and approach to this concept.

### ${headers.formula}:
[Write the formula using _{} for subscripts and ^{} for superscripts]

### ${headers.example}:
Present as clear steps:
• Step 1: [First step with calculation]
• Step 2: [Second step with calculation]
• Step 3: [Final result]
Then add 1-2 sentences explaining why this method works.

## ${headers.modern}

### ${headers.modernName}: [Modern term]

### ${headers.discovery}:
Write a paragraph (2-3 sentences) about who discovered this in Western mathematics and when.

### ${headers.modernExplanation}:
Write a descriptive paragraph (3-4 sentences) explaining the modern mathematical understanding and approach.

### ${headers.modernFormula}:
[Write the formula using _{} for subscripts and ^{} for superscripts]

### ${headers.modernExample}:
Present as clear steps:
• Step 1: [First step with calculation]
• Step 2: [Second step with calculation]
• Step 3: [Final result]
Then add 1-2 sentences comparing to the Vedic method.

## ${headers.connection}

### ${headers.relate}:
Write a paragraph (2-3 sentences) explaining how ancient and modern approaches connect.

### ${headers.advantage}:
Write as bullet points:
• Speed: [Why Vedic method is faster]
• Mental Math: [Why easier to do mentally]
• Efficiency: [Why fewer steps needed]

### ${headers.cultural}:
Write a brief paragraph (2 sentences) about the cultural and philosophical significance.

## ${headers.comparison}

Write as a structured comparison table:

| Feature | Traditional Method | Vedic Method |
|---------|-------------------|--------------|
| Steps | [X] steps | [Y] steps |
| Complexity | [Describe traditional complexity] | [Describe Vedic simplicity] |
| Time Saved | Baseline | Approximately [Z]% faster |
| Mental Calculation | [Harder/Easier - brief reason] | [Easier/Harder - brief reason] |

## ${headers.applications}

Present as bullet points with brief descriptions:
• [Field 1]: [How it's used - 1 sentence]
• [Field 2]: [How it's used - 1 sentence]
• [Field 3]: [How it's used - 1 sentence]

Question: ${question}

IMPORTANT: Mix descriptive paragraphs for concepts with clear bullet points for steps, advantages, and applications. Use proper mathematical notation (_{} for subscripts, ^{} for superscripts).${langInstruction}`;
}

module.exports = {
  getSectionHeaders,
  getLanguageInstruction,
  generateAncientModernPrompt,
};
