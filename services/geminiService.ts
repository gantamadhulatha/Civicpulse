
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, Priority } from "../types";

export const analyzeIssue = async (description: string, imageData?: string): Promise<AIAnalysis> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment.");
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemPrompt = `
    You are an expert civic dispatcher. Analyze the reported issue.
    Classify priority:
    - High: Emergencies, life/safety threats (fire, gas, accidents, flood).
    - Medium: Infrastructure failures (potholes, lights, garbage).
    - Low: General complaints (noise, graffiti).

    Required JSON output:
    {
      "priority": "High" | "Medium" | "Low",
      "summary": "Brief 1-sentence title",
      "reason": "Explain classification reasoning",
      "score": number (0-100)
    }
  `;

  const parts: any[] = [{ text: description }];
  
  if (imageData) {
    try {
      const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      });
    } catch (err) {
      console.warn("Failed to process image part:", err);
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: { type: Type.STRING },
            summary: { type: Type.STRING },
            reason: { type: Type.STRING },
            score: { type: Type.NUMBER }
          },
          required: ["priority", "summary", "reason", "score"]
        }
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    
    return {
      priority: (result.priority as Priority) || Priority.LOW,
      summary: result.summary || "Civic Report",
      reason: result.reason || "Processed by AI.",
      score: result.score || 0
    };
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      priority: Priority.LOW,
      summary: "Manual Review Required",
      reason: "AI was unable to process the request automatically.",
      score: 0
    };
  }
};
