import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateCampaign(prompt: string): Promise<{ subjectLines: string[]; body: string; imagePrompt: string; }> {
    const campaignSchema = {
      type: Type.OBJECT,
      properties: {
        subjectLines: {
          type: Type.ARRAY,
          description: '3-5 compelling and creative subject line options for the email.',
          items: { type: Type.STRING }
        },
        body: {
          type: Type.STRING,
          description: 'The full body copy of the email, formatted with paragraphs and calls to action. Use markdown-style formatting like **bold** or *italics*.'
        },
        imagePrompt: {
            type: Type.STRING,
            description: 'A detailed, descriptive prompt for an AI image generator to create a visually appealing and relevant image for this email campaign.'
        }
      },
      required: ['subjectLines', 'body', 'imagePrompt']
    };

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a complete email marketing campaign based on the following request: "${prompt}"`,
      config: {
        systemInstruction: "You are an expert email marketing copywriter and strategist. Generate creative, effective, and engaging email campaign content. The body should be ready to be sent.",
        responseMimeType: "application/json",
        responseSchema: campaignSchema,
      },
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
  }

  async generateImage(prompt: string, aspectRatio: '1:1' | '16:9' | '9:16'): Promise<string> {
    const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        },
    });
    
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
  }
  
  createChat(): Chat {
    return this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a friendly and helpful marketing assistant. Answer questions concisely and clearly.',
      },
    });
  }
}
