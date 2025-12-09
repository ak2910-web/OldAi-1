/**
 * FORMATTING LAYER
 * Cleans, formats, and beautifies AI responses
 */

/**
 * Main formatting function - applies all formatting rules
 * @param {string} text - Raw AI response
 * @returns {string} - Formatted text
 */
const formatResponse = (text) => {
  if (!text) return '';
  
  let formatted = text;
  
  // 1. Normalize newlines
  formatted = normalizeNewlines(formatted);
  
  // 2. Fix math symbols
  formatted = fixMathSymbols(formatted);
  
  // 3. Apply indentation
  formatted = applyIndentation(formatted);
  
  // 4. Remove empty sections
  formatted = removeEmptySections(formatted);
  
  // 5. Clean extra spaces
  formatted = cleanSpaces(formatted);
  
  // 6. Format tables
  formatted = formatTables(formatted);
  
  return formatted.trim();
};

/**
 * Normalize all newline patterns to consistent \n
 * @param {string} text
 * @returns {string}
 */
const normalizeNewlines = (text) => {
  // Replace all variations of newlines: /n, /nn, \\n, \\n\\n, \r\n, \r
  text = text.replace(/\\n\\n|\/n\/n|\\\\n\\\\n/g, '\n\n');
  text = text.replace(/\\n|\/n|\\\\n|\r\n|\r/g, '\n');
  
  // Collapse 3+ consecutive newlines to 2 (paragraph spacing)
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // Remove whitespace-only lines between sections
  text = text.replace(/\n\s+\n/g, '\n\n');
  
  return text;
};

/**
 * Fix mathematical symbols for better display
 * @param {string} text
 * @returns {string}
 */
const fixMathSymbols = (text) => {
  // Superscripts (powers)
  text = text.replace(/\^2/g, '²');
  text = text.replace(/\^3/g, '³');
  text = text.replace(/\^4/g, '⁴');
  text = text.replace(/\^5/g, '⁵');
  text = text.replace(/\^6/g, '⁶');
  text = text.replace(/\^7/g, '⁷');
  text = text.replace(/\^8/g, '⁸');
  text = text.replace(/\^9/g, '⁹');
  text = text.replace(/\^0/g, '⁰');
  text = text.replace(/\^1/g, '¹');
  
  // Square roots
  text = text.replace(/sqrt\(([^)]+)\)/gi, '√($1)');
  text = text.replace(/√\{([^}]+)\}/g, '√($1)');
  
  // Common fractions
  text = text.replace(/\b1\/2\b/g, '½');
  text = text.replace(/\b1\/3\b/g, '⅓');
  text = text.replace(/\b2\/3\b/g, '⅔');
  text = text.replace(/\b1\/4\b/g, '¼');
  text = text.replace(/\b3\/4\b/g, '¾');
  text = text.replace(/\b1\/5\b/g, '⅕');
  text = text.replace(/\b1\/6\b/g, '⅙');
  text = text.replace(/\b1\/8\b/g, '⅛');
  
  // Multiplication and division symbols
  text = text.replace(/\s*[×x]\s*/g, ' × ');
  text = text.replace(/\s*÷\s*/g, ' ÷ ');
  
  // Plus/minus
  text = text.replace(/\+\-/g, '±');
  text = text.replace(/\-\+/g, '∓');
  
  // Approximately equal
  text = text.replace(/~=/g, '≈');
  text = text.replace(/approx/gi, '≈');
  
  // Not equal
  text = text.replace(/!=/g, '≠');
  
  // Less than or equal, greater than or equal
  text = text.replace(/<=/g, '≤');
  text = text.replace(/>=/g, '≥');
  
  // Infinity
  text = text.replace(/\binfinity\b/gi, '∞');
  
  // Pi
  text = text.replace(/\bpi\b/gi, 'π');
  
  return text;
};

/**
 * Apply indentation to steps and bullet points
 * @param {string} text
 * @returns {string}
 */
const applyIndentation = (text) => {
  // Indent numbered steps
  text = text.replace(/^(Step \d+:)/gm, '  → $1');
  
  // Ensure bullet points have proper spacing
  text = text.replace(/^•\s*/gm, '• ');
  text = text.replace(/^-\s+/gm, '• ');
  
  // Indent sub-bullets
  text = text.replace(/^\s{2,}•\s*/gm, '    • ');
  
  return text;
};

/**
 * Remove empty or nearly-empty sections
 * @param {string} text
 * @returns {string}
 */
const removeEmptySections = (text) => {
  // Remove sections with only whitespace or dashes
  text = text.replace(/\*\*[^*]+\*\*:\s*\n\s*\n/g, '');
  text = text.replace(/\*\*[^*]+\*\*:\s*[-\s]*\n/g, '');
  
  // Remove sections that say "N/A" or "None" or "Not applicable"
  text = text.replace(/\*\*[^*]+\*\*:\s*(N\/A|None|Not applicable|—)\s*\n/gi, '');
  
  return text;
};

/**
 * Clean extra spaces and whitespace
 * @param {string} text
 * @returns {string}
 */
const cleanSpaces = (text) => {
  // Remove multiple spaces (but preserve indentation)
  text = text.replace(/[^\S\n]+/g, ' ');
  
  // Remove trailing spaces at end of lines
  text = text.replace(/[ \t]+$/gm, '');
  
  // Remove space before punctuation
  text = text.replace(/\s+([.,;:!?])/g, '$1');
  
  return text;
};

/**
 * Format tables for better readability
 * @param {string} text
 * @returns {string}
 */
const formatTables = (text) => {
  // Find markdown tables and ensure proper spacing
  text = text.replace(/\n\|(.+?)\|\n\|([-:\| ]+)\|\n((?:\|.+\|\n?)+)/g, (match, header, separator, rows) => {
    // Ensure table has blank lines around it
    return `\n\n${match.trim()}\n\n`;
  });
  
  return text;
};

/**
 * Extract sections from formatted response
 * Useful for React Native to render sections dynamically
 * @param {string} text - Formatted response
 * @returns {Object} - Parsed sections
 */
const extractSections = (text) => {
  const sections = {};
  const lines = text.split('\n');
  let currentSection = 'intro';
  let currentContent = [];
  
  for (const line of lines) {
    // Check if line is a bold heading (section marker)
    const headingMatch = line.match(/^\*\*([^*]+)\*\*:?\s*$/);
    
    if (headingMatch) {
      // Save previous section
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      
      // Start new section
      const sectionName = headingMatch[1]
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      currentSection = sectionName;
      currentContent = [];
    } else {
      // Add line to current section
      if (line.trim()) {
        currentContent.push(line);
      }
    }
  }
  
  // Save last section
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim();
  }
  
  return sections;
};

/**
 * Get short preview of text (for history/cache)
 * @param {string} text - Full text
 * @param {number} maxLength - Max preview length
 * @returns {string} - Preview text
 */
const getPreview = (text, maxLength = 200) => {
  if (!text) return '';
  
  const cleaned = text
    .replace(/\*\*/g, '')  // Remove bold markers
    .replace(/\n+/g, ' ')  // Replace newlines with spaces
    .replace(/\s+/g, ' ')  // Collapse multiple spaces
    .trim();
  
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  return cleaned.substring(0, maxLength) + '...';
};

module.exports = {
  formatResponse,
  normalizeNewlines,
  fixMathSymbols,
  applyIndentation,
  removeEmptySections,
  cleanSpaces,
  formatTables,
  extractSections,
  getPreview
};
