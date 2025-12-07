import { GoogleGenAI } from "@google/genai";

// Safe access to process.env.API_KEY for browser environments
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }
  return '';
};

const apiKey = getApiKey();
// Initialize only if we have a key (or let it fail gracefully later)
// We pass the key regardless, but the safe accessor prevents the crash during module load.
const ai = new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY' });

export const generateChatResponse = async (history: string[], userMessage: string): Promise<string> => {
  try {
    if (!apiKey || apiKey === 'MISSING_KEY') {
      return "System Error: API_KEY is missing from environment. Please configure your API key to use the AI assistant.";
    }

    const systemPrompt = `
      You are an AI assistant embedded in a portfolio website. 
      The website uses a 'Nothing' (tech brand) aesthetic and a desktop OS metaphor.
      Keep your answers concise, technical, and slightly robotic but helpful.
      You represent the engineer who built this site.
      Do not use markdown formatting extensively, plain text is preferred for this raw terminal look.
    `;

    const model = 'gemini-2.5-flash';
    
    // We construct a simple prompt chain here for the single-turn effect or basic history
    const prompt = `
      ${systemPrompt}
      
      Conversation History:
      ${history.join('\n')}
      
      User: ${userMessage}
      Assistant:
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "I processed that, but have no output.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Communication with the neural link failed. Please try again.";
  }
};