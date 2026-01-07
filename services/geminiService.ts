
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export class GeminiChatSession {
  private chat: Chat;

  constructor() {
    const ai = getAIClient();
    this.chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });
  }

  async sendMessage(text: string): Promise<string> {
    try {
      const result: GenerateContentResponse = await this.chat.sendMessage({ message: text });
      return result.text || "Uzr, javob topa olmadim.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Kechirasiz, texnik nosozlik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    }
  }

  async sendMessageStream(text: string, onChunk: (chunk: string) => void): Promise<void> {
    try {
      const response = await this.chat.sendMessageStream({ message: text });
      for await (const chunk of response) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          onChunk(c.text);
        }
      }
    } catch (error) {
      console.error("Gemini Streaming Error:", error);
      throw new Error("Kechirasiz, oqimli javobda xatolik yuz berdi.");
    }
  }
}
