import { env } from '../config/env';

export async function summarizeHeadline(headline: string): Promise<string> {
  const prompt = `Rewrite this financial headline into one simple, plain-English sentence that anyone can understand. Keep it to one sentence max.\n\nHeadline: ${headline}`;

  // 1. Try Gemini first
  if (env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          temperature: 0,
        },
      });

      const text = response.text?.trim();
      if (text) return text;
    } catch (err: any) {
      console.warn('[Gemini summarizeHeadline error]:', err?.message || err);
    }
  }

  // 2. Try OpenAI if available
  if (env.OPENAI_API_KEY) {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Rewrite this financial headline into one simple, plain-English sentence that anyone can understand. Keep it to one sentence max.',
          },
          { role: 'user', content: headline },
        ],
        temperature: 0,
        max_tokens: 100,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (content) return content;
    } catch (err: any) {
      console.warn('[OpenAI summarizeHeadline error]:', err?.message || err);
    }
  }

  // 3. Fallback: Clean string
  return headline.replace(/\s+/g, ' ').trim();
}
