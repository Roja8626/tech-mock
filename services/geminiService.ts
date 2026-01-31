import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuestions = async (topic: string, count: number = 5): Promise<Question[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} difficult technical interview multiple-choice questions about "${topic}". 
      Each question must have 4 options and one correct answer index (0-3).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "The question text" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Array of 4 possible answers"
              },
              correctOptionIndex: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
              category: { type: Type.STRING, description: "The specific sub-topic or category" }
            },
            required: ["text", "options", "correctOptionIndex", "category"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const rawQuestions = JSON.parse(jsonText);
    
    // Transform to our internal Question type with unique IDs
    return rawQuestions.map((q: any) => ({
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: q.text,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      category: q.category || topic
    }));

  } catch (error) {
    console.error("Failed to generate questions:", error);
    throw error;
  }
};
