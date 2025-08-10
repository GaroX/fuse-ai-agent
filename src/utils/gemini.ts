import { GoogleGenAI } from '@google/genai';
import SecretService from './secretManager';

interface GeminiUsage {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

export default class GeminiClient {
  private static genAI?: GoogleGenAI;
  private static initializing = false;

  private static async init(): Promise<void> {
    if (this.genAI || this.initializing) return;
    this.initializing = true;

    const GEMINI_APIKEY = (await SecretService.get("GEMINI_API_KEY")) as string;
    if (!GEMINI_APIKEY) throw new Error("Gemini API key is required");

    this.genAI = new GoogleGenAI({ apiKey: GEMINI_APIKEY });
    this.initializing = false;
  }

  private static logGeminiUsage(usage: GeminiUsage) {
    console.log(`Gemini promptTokenCount: ${usage.promptTokenCount ?? 'N/A'} (tokens sent in the prompt; input billing)`);
    console.log(`Gemini responseTokenCount: ${usage.candidatesTokenCount ?? 'N/A'} (tokens generated in the response; output billing)`);
    console.log(`Gemini totalTokenCount: ${usage.totalTokenCount ?? 'N/A'} (full tokens for request)`);

    if (usage.promptTokenCount !== undefined && usage.candidatesTokenCount !== undefined) {
      const totalBilled = (usage.promptTokenCount + usage.candidatesTokenCount);
      console.log(`Gemini billable tokens (prompt + response): ${totalBilled}`);
    }
  }

  public static async prompt(prompt: string): Promise<string | undefined> {
    if (!this.genAI) await this.init();

    const response = await this.genAI!.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const usage = response.usageMetadata ?? {};
    // this.logGeminiUsage(usage);

    return response.text;
  }
}
