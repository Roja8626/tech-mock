import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

// Read the API key injected at build-time by Vite (define)
const API_KEY = (process.env.API_KEY || process.env.GEMINI_API_KEY) as string | undefined;

const createAiClient = (apiKey?: string) => {
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const mockGenerate = (topic: string, count: number) => {
  const qs: Question[] = [];
  for (let i = 0; i < count; i++) {
    qs.push({
      id: `mock-${Date.now()}-${i}`,
      text: `Mock question ${i + 1} about ${topic}`,
      options: [
        `Option A for ${topic}`,
        `Option B for ${topic}`,
        `Option C for ${topic}`,
        `Option D for ${topic}`,
      ],
      correctOptionIndex: Math.floor(Math.random() * 4),
      category: topic,
    });
  }
  return qs;
};

export const generateQuestions = async (topic: string, count: number = 5): Promise<Question[]> => {
  // If no API key is provided at build time, don't attempt to call the Google GenAI client in the browser.
  if (!API_KEY) {
    console.warn('GEMINI_API_KEY not set. Returning mock questions instead of calling Google GenAI.');
    return mockGenerate(topic, count);
  }

  const ai = createAiClient(API_KEY);
  if (!ai) {
    console.warn('Failed to create AI client; returning mock questions.');
    return mockGenerate(topic, count);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} difficult technical interview multiple-choice questions about "${topic}".\nEach question must have 4 options and one correct answer index (0-3).`,
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
    // On errors, fall back to mock items so the UI remains usable
    return mockGenerate(topic, count);
  }
};
