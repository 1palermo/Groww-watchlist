import { env } from '../config/env';

export interface ThesisMatchResult {
  verdict: 'validated' | 'challenged' | 'neutral';
  reasoning: string;
}

const SYSTEM_INSTRUCTION = `You classify a news headline against ONE fixed thesis category.
Return strict JSON: { "verdict": "validated" | "challenged" | "neutral", "reasoning": "<one sentence>" }
Rules:
- "waiting_for_profitability": validated only if headline clearly states a profit/loss result.
- "dividend_play": validated only if headline is a dividend/payout announcement.
- "long_term_growth": validated only if headline is expansion/M&A/strategic, not routine.
- Otherwise return "neutral" — do not guess.`;

export async function matchThesis(
  category: string,
  headline: string
): Promise<ThesisMatchResult> {
  const userPrompt = `User thesis category: ${category}\nHeadline: ${headline}`;

  // 1. Try Gemini first if GEMINI_API_KEY is provided
  if (env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: `${SYSTEM_INSTRUCTION}\n\n${userPrompt}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0,
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return {
        verdict: parsed.verdict || 'neutral',
        reasoning: parsed.reasoning || 'Classified by Gemini',
      };
    } catch (geminiError: any) {
      console.warn('[Gemini matchThesis error, trying fallback]:', geminiError?.message || geminiError);
    }
  }

  // 2. Try OpenAI if OPENAI_API_KEY is configured
  if (env.OPENAI_API_KEY) {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0,
        max_tokens: 150,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);
      return {
        verdict: parsed.verdict || 'neutral',
        reasoning: parsed.reasoning || 'Classified by OpenAI',
      };
    } catch (openAiError: any) {
      console.warn('[OpenAI matchThesis error]:', openAiError?.message || openAiError);
    }
  }

  // 3. Fallback / Mock heuristic classification for demo reliability
  const lowerHeadline = headline.toLowerCase();
  if (category === 'waiting_for_profitability') {
    if (lowerHeadline.includes('profit') || lowerHeadline.includes('loss') || lowerHeadline.includes('net income') || lowerHeadline.includes('ebitda')) {
      const isPositive = lowerHeadline.includes('record profit') || lowerHeadline.includes('surges') || lowerHeadline.includes('positive') || lowerHeadline.includes('first profit') || lowerHeadline.includes('profitable');
      return {
        verdict: isPositive ? 'validated' : 'challenged',
        reasoning: `Earnings update mentions profitability metrics: "${headline.slice(0, 60)}..."`,
      };
    }
  } else if (category === 'dividend_play') {
    if (lowerHeadline.includes('dividend') || lowerHeadline.includes('payout') || lowerHeadline.includes('buyback')) {
      return {
        verdict: 'validated',
        reasoning: `Headline announces dividend distribution or shareholder payout.`,
      };
    }
  } else if (category === 'long_term_growth') {
    if (lowerHeadline.includes('acquisition') || lowerHeadline.includes('acquires') || lowerHeadline.includes('expands') || lowerHeadline.includes('expansion') || lowerHeadline.includes('partnership') || lowerHeadline.includes('billion')) {
      return {
        verdict: 'validated',
        reasoning: `Headline indicates strategic long-term corporate growth or expansion initiative.`,
      };
    }
  }

  return {
    verdict: 'neutral',
    reasoning: 'News event reviewed; no clear catalyst validating or challenging thesis.',
  };
}
