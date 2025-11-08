const BASE_URL = "http://10.0.2.2:5005/react-native-oldai/us-central1"; // Firebase Functions emulator for Android

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

export const getResonance = async (text) => {
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      console.log('🌐 Sending request to:', `${BASE_URL}/answerQuestion`);
      console.log('📝 Request body:', { question: text });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

      const res = await fetch(`${BASE_URL}/answerQuestion`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ question: text }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📊 Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Server error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      console.log('✅ Response received successfully');
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.answer) {
        throw new Error('No answer received from server');
      }
      
      return data.answer;
      
    } catch (error) {
      console.error(`❌ Attempt ${retries + 1} failed:`, error.message);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 90 seconds. Please try again.');
      }
      
      // Check for network errors
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please make sure:\n1. Firebase emulator is running\n2. You have internet connection\n3. Try restarting the app');
      }
      
      if (retries === MAX_RETRIES) {
        throw new Error(`Connection failed: ${error.message}`);
      }
      
      retries++;
      console.log(`⏳ Retrying in ${retries} second(s)...`);
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
