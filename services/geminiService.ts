import { generateLocalResponse } from './localAssistant';

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

/** True when a real model is available; false means we serve local responses. */
export const hasApiKey = Boolean(apiKey && apiKey !== 'MISSING_KEY');

/** Small artificial delay so local replies feel like a round-trip, not a lookup. */
const humanPause = () => new Promise((r) => setTimeout(r, 350 + Math.random() * 500));

export const generateChatResponse = async (history: string[], userMessage: string): Promise<string> => {
  // No key configured → serve the hand-written local assistant. It's
  // comprehensive enough that the terminal feels alive with no model behind
  // it; the moment a key is added we use Gemini instead. (See localAssistant.ts.)
  if (!hasApiKey) {
    await humanPause();
    return generateLocalResponse(history, userMessage);
  }

  try {
    // Imported lazily so the SDK only loads when a key is actually present.
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `
      You are an AI assistant embedded in a portfolio website.
      The website uses a 'Nothing' (tech brand) aesthetic and a desktop OS metaphor.
      You represent Luka Dadiani, a Product Manager & Senior Designer in London with 9+ years of experience.
      Keep your answers concise, technical, and dryly witty but helpful.
      Do not use markdown formatting; plain text suits this raw terminal look.
    `;

    const prompt = `
      ${systemPrompt}

      Conversation History:
      ${history.join('\n')}

      User: ${userMessage}
      Assistant:
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || generateLocalResponse(history, userMessage);
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Fall back to the local assistant rather than surfacing a raw error.
    return generateLocalResponse(history, userMessage);
  }
};
