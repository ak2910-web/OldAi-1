// Utility: Clean and format AI response for React Native output (handles \n, \", math, etc.)
export function formatResponse(text = "") {
  if (!text) return "";
  return text
    .replace(/\\n/g, '\n')
    .replace(/\n{2,}/g, '\n\n')
    .replace(/\\"/g, '"')
    .replace(/\\t/g, ' ')
    .replace(/\*\*(\d+)/g, '^($1)')
    .replace(/sqrt\((.*?)\)/g, '√($1)')
    .replace(/\*(?=\d)/g, ' × ')
    .replace(/\/(?=\d)/g, ' ÷ ')
    .trim();
}
export const BASE_URL = "http://10.38.78.61:5005/demo-no-project/us-central1";
// Firebase Functions emulator for Android

const MAX_RETRIES = 1;
const TIMEOUT = 90000; // 90 seconds - generous timeout for Gemini API

// Simple connection test
const testConnection = async () => {
  try {
    const response = await fetch('https://www.google.com');
    return response.ok;


    
  } catch (error) {
    return false;
  }
};

export const getResonance = async (text, language = 'English') => {
  let retries = 0;
  while (retries <= MAX_RETRIES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
      const res = await fetch(`${BASE_URL}/answerQuestion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          question: text,
          language: language
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error (${res.status}): ${errorText}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.answer) throw new Error('No answer received from server');
      // Return all fields for advanced UI/hooks
      return {
        answer: data.answer,
        parsed: data.parsed,
        tokenCount: data.tokenCount,
        cached: data.cached || false
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 90 seconds. Please try again.');
      }
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please make sure:\n1. Firebase emulator is running\n2. You have internet connection\n3. Try restarting the app');
      }
      if (retries === MAX_RETRIES) {
        throw new Error(`Connection failed: ${error.message}`);
      }
      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
};

export const extractText = async (base64Image, mimeType) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const res = await fetch(`${BASE_URL}/processImage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        base64Image,
        mimeType 
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server responded with status ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    
    return { text: data.answer };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Image processing request timed out. Please try again.');
    }
    console.error('Error in extractText:', error);
    throw error;
  }
};

// Get recent searches
export const getRecentSearches = async (limit = 10) => {
  try {
    console.log('📜 Fetching recent searches...');
    
    const res = await fetch(`${BASE_URL}/getRecentSearches?limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    console.log(`✅ Fetched ${data.count} recent searches`);
    return data.searches || [];
    
  } catch (error) {
    console.error('❌ Error fetching recent searches:', error);
    return []; // Return empty array on error
  }
}

// Utility: Clean and format API response for React Native output
export function prepareOutput(raw) {
  if (!raw) return '';
  let text = raw;
  // Normalize all newline patterns: /n, /nn, \n, \n\n, \r\n, \r
  text = text.replace(/(\\n|\/n|\\n\\n|\/nn|\n\n|\r\n|\r)/g, '\n');
  // Collapse 3+ newlines to 2 (paragraph spacing)
  text = text.replace(/\n{3,}/g, '\n\n');
  // Math formatting: powers, roots, fractions
  text = text.replace(/\^2/g, '²')
             .replace(/\^3/g, '³')
             .replace(/\^4/g, '⁴')
             .replace(/\^5/g, '⁵')
             .replace(/sqrt\(([^)]+)\)/g, '√$1')
             .replace(/1\/2/g, '½')
             .replace(/1\/3/g, '⅓')
             .replace(/1\/4/g, '¼')
             .replace(/3\/4/g, '¾');
  // Bold headings (simple heuristic)
  text = text.replace(/(Vedic Method|Modern Method|Formula|Steps|Example|Explanation|Main Topic|Ancient Vedic Perspective|Modern Mathematical Perspective|The Connection|Applications|Comparison)/g, match => `**${match}**`);
  // Indent steps
  text = text.replace(/(Step \d+:)/g, '\n    $1');
  // Clean up extra spaces
  text = text.replace(/ +/g, ' ');

  // Format markdown-style tables as readable columns
  text = text.replace(/\n\|(.+?)\|\n\|([\-\| ]+)\|\n((\|.+\|\n)+)/g, (match, header, sep, rows) => {
    // Split header and rows
    const headers = header.split('|').map(h => h.trim());
    const rowLines = rows.trim().split('\n').map(r => r.split('|').map(c => c.trim()));
    // Build readable table
    let out = '\n';
    out += headers.map(h => h.padEnd(18)).join(' | ') + '\n';
    out += headers.map(() => '------------------').join(' | ') + '\n';
    rowLines.forEach(cols => {
      if (cols.length === headers.length) {
        out += cols.map(c => c.padEnd(18)).join(' | ') + '\n';
      }
    });
    return out;
  });

  return text.trim();
}
