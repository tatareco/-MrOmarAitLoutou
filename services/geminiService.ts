
import { GoogleGenAI, Type, Schema } from "@google/genai";

// Helper to get the client lazily.
// This prevents the app from crashing immediately on load if process.env is undefined in some environments.
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing in environment variables.");
    // We return a dummy client or throw, but this way the app shell still loads.
    throw new Error("API Key is missing. Please check your settings.");
  }
  return new GoogleGenAI({ apiKey });
};

const quizSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswer: { type: Type.STRING },
    },
    required: ["question", "options", "correctAnswer"],
  },
};

const scenarioSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    scenario: { type: Type.STRING },
    question: { type: Type.STRING },
  },
  required: ["scenario", "question"],
};

/**
 * Generates a quiz from text using the powerful Gemini 3 Pro model with Thinking Mode.
 * @param text The source text.
 * @returns JSON object containing questions.
 */
export const generateQuiz = async (text: string) => {
  try {
    const ai = getAiClient();
    const prompt = `Based on the following text, generate 5 multiple-choice questions in Arabic (or French if the text is French) to test comprehension. 
    The text is: """${text}"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Thinking mode supported
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        thinkingConfig: { thinkingBudget: 32768 }, // Enable thinking with max budget
      },
    });

    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};

/**
 * Evaluates a user's open-ended answer using Thinking Mode for deeper analysis.
 */
export const evaluateAnswer = async (referenceText: string, question: string, userAnswer: string) => {
  try {
    const ai = getAiClient();
    const prompt = `You are an educational assistant. Evaluate the following student answer based on the reference text and question provided. 
    Provide constructive feedback in the same language as the answer. Be concise but helpful.
    
    Reference Text: """${referenceText}"""
    Question: "${question}"
    Student Answer: "${userAnswer}"
    
    Evaluation:`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Use Thinking Mode for better evaluation
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error evaluating answer:", error);
    throw error;
  }
};

/**
 * Generates a role-play scenario for skill practice.
 */
export const generateSkillScenario = async (skillName: string, description: string, specialization: string) => {
  try {
    const ai = getAiClient();
    const prompt = `Create a realistic, short professional scenario for the skill: '${skillName}' (${description}), related to the specialization: '${specialization}'.
    Then ask an open-ended question on how to handle it. Output in JSON. Use Arabic.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scenarioSchema,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating scenario:", error);
    throw error;
  }
};

/**
 * Evaluates the skill practice response.
 */
export const evaluateSkillResponse = async (skillName: string, scenario: string, userAnswer: string) => {
  try {
    const ai = getAiClient();
    const prompt = `You are a professional coach. A trainee responded to a scenario about '${skillName}'.
    Scenario: "${scenario}"
    Response: "${userAnswer}"
    
    Provide constructive, encouraging feedback in Arabic. Highlight positives and suggest improvements.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error evaluating skill response:", error);
    throw error;
  }
};

/**
 * Standard chat interface (can use Flash for speed or Pro for quality).
 */
export const sendChatMessage = async (
  model: string, 
  history: {role: string, parts: {text: string}[]}[], 
  message: string,
  systemInstruction?: string
) => {
  try {
    const ai = getAiClient();
    // If model is gemini-3-pro-preview, we apply thinking config automatically for complex queries
    const isThinkingModel = model === "gemini-3-pro-preview";
    
    const response = await ai.models.generateContent({
      model: model,
      contents: [...history, { role: "user", parts: [{ text: message }] }],
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: isThinkingModel ? { thinkingBudget: 32768 } : undefined
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
}

