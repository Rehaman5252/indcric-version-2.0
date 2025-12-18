'use server';

import { ai, MODEL_NAME } from '@/ai/genkit';
import { z } from 'zod';

const IS_DEV = process.env.NODE_ENV !== 'production';

const GenerateFactsInputSchema = z.object({
  context: z.string().describe('Context or topic for the cricket fact'),
  count: z
    .number()
    .min(1)
    .max(10)
    .default(1)
    .describe('Number of facts to generate'),
});

export type GenerateFactsInput = z.infer<typeof GenerateFactsInputSchema>;

const FactSchema = z.object({
  fact: z.string().min(10).describe('The cricket fact text'),
  category: z.enum(['player', 'team', 'record', 'historical', 'rules', 'tournament']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

const GenerateFactsOutputSchema = z.object({
  facts: z.array(FactSchema),
  source: z.enum(['ai', 'fallback']),
});

export type GenerateFactsOutput = z.infer<typeof GenerateFactsOutputSchema>;

/**
 * Fallback facts used when the AI call fails completely
 */
const getFallbackFacts = (count: number): GenerateFactsOutput => {
  const fallbackFactsPool: GenerateFactsOutput['facts'] = [
    {
      fact: 'Sachin Tendulkar is the highest run-scorer in Test cricket with 15,921 runs.',
      category: 'player',
      difficulty: 'easy',
    },
    {
      fact: 'The first Test match was played between Australia and England in 1877.',
      category: 'historical',
      difficulty: 'medium',
    },
    {
      fact: 'Chris Gayle holds one of the highest individual scores in T20 cricket with 175* in the IPL.',
      category: 'record',
      difficulty: 'medium',
    },
    {
      fact: 'India won its first Cricket World Cup in 1983 under Kapil Dev.',
      category: 'tournament',
      difficulty: 'easy',
    },
    {
      fact: 'A cricket ball must weigh between 155.9 and 163 grams according to Laws of Cricket.',
      category: 'rules',
      difficulty: 'hard',
    },
  ];

  return {
    facts: fallbackFactsPool.slice(0, Math.min(count, fallbackFactsPool.length)),
    source: 'fallback',
  };
};

/**
 * Prompt definition – IMPORTANT: force the model to output strict JSON
 */
const prompt = ai.definePrompt({
  name: 'generateCricketFactsPrompt',
  model: MODEL_NAME,
  input: { schema: GenerateFactsInputSchema as any },
  output: { schema: z.any() as any }, // raw first, we will validate manually
  prompt: `
You are a cricket statistics expert.

Generate {{count}} interesting, accurate cricket fact(s) related to: "{{context}}".

Guidelines:
- Each fact MUST be unique and verifiable.
- Prefer concrete stats: runs, wickets, averages, strike rate, records, dates, venues.
- Vary categories across player, team, record, historical, rules, tournament when possible.
- Difficulty:
  - "easy": very well-known facts
  - "medium": less obvious but still popular
  - "hard": niche stats or historical details

CRITICAL:
Return ONLY a single valid JSON object with this exact shape, no extra text:

{
  "facts": [
    {
      "fact": "string, at least 10 characters",
      "category": "player | team | record | historical | rules | tournament",
      "difficulty": "easy | medium | hard"
    }
  ],
  "source": "ai"
}

- "facts" array MUST contain exactly {{count}} items.
- "source" MUST be the string "ai".
  `,
  config: {
    temperature: 0.8,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 512,
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
});

export const generateCricketFactsFlow = ai.defineFlow(
  {
    name: 'generateCricketFactsFlow',
    inputSchema: GenerateFactsInputSchema as any,
    outputSchema: GenerateFactsOutputSchema as any,
  },
  async (input: GenerateFactsInput): Promise<GenerateFactsOutput> => {
    try {
      const { output } = await prompt(input);

      // In dev, log what the model actually returns
      if (IS_DEV) {
        console.log('[generateCricketFactsFlow] Raw model output:', output);
      }

      // Try to parse & validate the output
      const validation = GenerateFactsOutputSchema.safeParse(output);

      if (!validation.success) {
        // Soft fallback: try to salvage valid facts if the shape is close
        if (IS_DEV) {
          console.warn('[generateCricketFactsFlow] Validation failed:', validation.error?.flatten());
        }

        // If it looks like the model sent { facts: [...] } without source, try to coerce it
        if (output && Array.isArray((output as any).facts)) {
          const factsParse = z.array(FactSchema).safeParse((output as any).facts);
          if (factsParse.success && factsParse.data.length > 0) {
            return {
              facts: factsParse.data.slice(0, input.count),
              source: 'ai',
            };
          }
        }

        // Hard fallback only if nothing usable
        console.warn('[generateCricketFactsFlow] Using fallback facts due to invalid output');
        return getFallbackFacts(input.count);
      }

      // Validation OK → ensure count matches
      const trimmedFacts =
        validation.data.facts.length >= input.count
          ? validation.data.facts.slice(0, input.count)
          : validation.data.facts;

      return {
        facts: trimmedFacts,
        source: 'ai',
      };
    } catch (error: any) {
      console.error('[generateCricketFactsFlow] Error calling model, using fallback:', error?.message);
      return getFallbackFacts(input.count);
    }
  }
);

// Client-callable wrapper
export async function generateCricketFacts(input: GenerateFactsInput): Promise<GenerateFactsOutput> {
  try {
    return await generateCricketFactsFlow(input);
  } catch (error: any) {
    console.error('[generateCricketFacts] Flow error, using fallback:', error?.message);
    return getFallbackFacts(input.count);
  }
}
