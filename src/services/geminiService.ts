import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getBeautyAdvice(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a luxury beauty consultant named Von. Your tone is sophisticated, professional, and encouraging. You provide expert makeup advice, product recommendations, and skincare tips. Keep responses concise and elegant.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I apologize, but I'm currently unable to provide advice. Please try again later.";
  }
}
