
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const summarizeHealthReason = async (reason: string): Promise<string> => {
  if (!reason || reason.length < 10) return reason;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a clinical assistant. Summarize the following patient's reason for visiting into a professional, concise clinical brief for a doctor. Input: "${reason}"`,
      config: {
        maxOutputTokens: 100,
        temperature: 0.7,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("AI summarization failed", error);
    return reason;
  }
};
