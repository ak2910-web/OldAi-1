/**
 * Text Parser Utility
 * Cleans markdown, parses AI responses, and formats for React Native display
 */

/**
 * Remove all markdown formatting and return clean plain text
 */
export const stripMarkdown = (text) => {
  if (!text) return '';
  
  let cleaned = text;
  
  // Remove bold (**text** or __text__)
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');
  cleaned = cleaned.replace(/__(.+?)__/g, '$1');
  
  // Remove italic (*text* or _text_)
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1');
  cleaned = cleaned.replace(/_(.+?)_/g, '$1');
  
  // Remove strikethrough (~~text~~)
  cleaned = cleaned.replace(/~~(.+?)~~/g, '$1');
  
  // Remove code blocks (```...```)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code (`text`)
  cleaned = cleaned.replace(/`(.+?)`/g, '$1');
  
  // Remove headers (### text)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  
  // Remove links [text](url) - keep only text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  // Convert markdown lists to bullet points
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '• ');
  
  // Convert numbered lists
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '• ');
  
  // Normalize newlines
  cleaned = cleaned.replace(/\\n/g, '\n');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Clean up extra spaces
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  cleaned = cleaned.replace(/^\s+|\s+$/gm, '');
  
  return cleaned.trim();
};

/**
 * Convert markdown table to readable key-value pairs
 */
export const convertTableToList = (tableText) => {
  if (!tableText) return '';
  
  const lines = tableText.split('\n').filter(line => line.trim());
  const result = [];
  
  let headers = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip separator lines (|---|---|)
    if (line.includes('---')) continue;
    
    // Parse table row
    if (line.startsWith('|')) {
      const cells = line.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
      
      // First row is headers
      if (headers.length === 0) {
        headers = cells;
      } else {
        // Data rows
        if (cells.length > 0) {
          const key = cells[0];
          const values = cells.slice(1);
          
          // Format: "Key → Value1 vs Value2"
          if (values.length === 2) {
            result.push(`${key} → ${values[0]} vs ${values[1]}`);
          } else {
            result.push(`${key}: ${values.join(', ')}`);
          }
        }
      }
    }
  }
  
  return result.length > 0 ? result.join('\n') : tableText;
};

/**
 * Parse AI response into structured sections
 */
export const parseAIResponse = (text) => {
  if (!text) return null;
  
  const sections = {
    concept: '',
    sutra: '',
    sanskritName: '',
    meaning: '',
    vedicSteps: [],
    modernMethod: '',
    comparison: '',
    finalAnswer: '',
    raw: text
  };
  
  // Section patterns (flexible for multiple languages)
  const patterns = {
    concept: /(?:concept|अवधारणा|विषय):\s*([\s\S]*?)(?=(?:vedic sutra|sanskrit name|वैदिक सूत्र|संस्कृत नाम)|$)/i,
    sutra: /(?:vedic sutra|वैदिक सूत्र):\s*([\s\S]*?)(?=(?:sanskrit name|meaning|संस्कृत नाम|अर्थ)|$)/i,
    sanskritName: /(?:sanskrit name|संस्कृत नाम):\s*([\s\S]*?)(?=(?:meaning|steps|अर्थ|चरण)|$)/i,
    meaning: /(?:meaning|अर्थ):\s*([\s\S]*?)(?=(?:steps|modern|चरण|आधुनिक)|$)/i,
    steps: /(?:steps.*vedic|vedic.*steps|वैदिक.*चरण):\s*([\s\S]*?)(?=(?:modern|comparison|आधुनिक|तुलना)|$)/i,
    modern: /(?:modern method|आधुनिक विधि):\s*([\s\S]*?)(?=(?:comparison|final|तुलना|अंतिम)|$)/i,
    comparison: /(?:comparison|तुलना):\s*([\s\S]*?)(?=(?:final answer|conclusion|अंतिम उत्तर)|$)/i,
    finalAnswer: /(?:final answer|answer|conclusion|अंतिम उत्तर|उत्तर):\s*([\s\S]*?)$/i
  };
  
  // Extract concept
  const conceptMatch = text.match(patterns.concept);
  if (conceptMatch) {
    sections.concept = stripMarkdown(conceptMatch[1]).trim();
  }
  
  // Extract sutra
  const sutraMatch = text.match(patterns.sutra);
  if (sutraMatch) {
    sections.sutra = stripMarkdown(sutraMatch[1]).trim();
  }
  
  // Extract Sanskrit name
  const nameMatch = text.match(patterns.sanskritName);
  if (nameMatch) {
    sections.sanskritName = stripMarkdown(nameMatch[1]).trim();
  }
  
  // Extract meaning
  const meaningMatch = text.match(patterns.meaning);
  if (meaningMatch) {
    sections.meaning = stripMarkdown(meaningMatch[1]).trim();
  }
  
  // Extract steps
  const stepsMatch = text.match(patterns.steps);
  if (stepsMatch) {
    const stepsText = stepsMatch[1];
    
    // Parse numbered or bulleted steps
    const stepLines = stepsText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    sections.vedicSteps = stepLines.map(line => {
      // Remove markdown and numbering
      let cleaned = stripMarkdown(line);
      cleaned = cleaned.replace(/^\d+\.\s*/, '');
      cleaned = cleaned.replace(/^[-*•]\s*/, '');
      return cleaned;
    }).filter(step => step.length > 0);
  }
  
  // Extract modern method
  const modernMatch = text.match(patterns.modern);
  if (modernMatch) {
    sections.modernMethod = stripMarkdown(modernMatch[1]).trim();
  }
  
  // Extract comparison (convert tables if present)
  const comparisonMatch = text.match(patterns.comparison);
  if (comparisonMatch) {
    let compText = comparisonMatch[1].trim();
    
    // Check if it's a table
    if (compText.includes('|') && compText.includes('---')) {
      compText = convertTableToList(compText);
    } else {
      compText = stripMarkdown(compText);
    }
    
    sections.comparison = compText;
  }
  
  // Extract final answer
  const answerMatch = text.match(patterns.finalAnswer);
  if (answerMatch) {
    sections.finalAnswer = stripMarkdown(answerMatch[1]).trim();
  }
  
  return sections;
};

/**
 * Sanitize data for Firestore (remove undefined, functions, limit string length)
 */
export const sanitizeForFirestore = (data) => {
  if (!data) return null;
  
  // Convert to JSON and back to remove undefined/functions
  let cleaned = JSON.parse(JSON.stringify(data, (key, value) => {
    // Skip undefined
    if (value === undefined) return null;
    
    // Skip functions
    if (typeof value === 'function') return null;
    
    // Trim very long strings (Firestore limit is 1MB per field)
    if (typeof value === 'string' && value.length > 9000) {
      return value.substring(0, 9000) + '...';
    }
    
    return value;
  }));
  
  return cleaned;
};

/**
 * Format text for display with proper line breaks
 */
export const formatForDisplay = (text) => {
  if (!text) return '';
  
  let formatted = text;
  
  // Ensure consistent newlines
  formatted = formatted.replace(/\\n/g, '\n');
  
  // Add spacing after colons (for key:value pairs)
  formatted = formatted.replace(/:\s*/g, ': ');
  
  // Add spacing after bullet points
  formatted = formatted.replace(/•\s*/g, '• ');
  
  // Collapse excessive newlines
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  return formatted.trim();
};

export default {
  stripMarkdown,
  convertTableToList,
  parseAIResponse,
  sanitizeForFirestore,
  formatForDisplay
};
