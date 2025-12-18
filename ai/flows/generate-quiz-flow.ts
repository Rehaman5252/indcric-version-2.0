'use server';

import { googleAI_SDK, MODEL_NAME } from '@/ai/genkit';
import { z } from 'zod';
import { QuizData } from '@/ai/schemas';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const GenerateQuizInputSchema = z.object({
    format: z.string().describe('The cricket format for the quiz'),
    userId: z.string().describe('The ID of the user requesting the quiz'),
});
type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const getRecentQuestions = async (userId: string): Promise<string[]> => {
    if (!db) {
        console.log("[getRecentQuestions] Database not initialized");
        return [];
    }
    
    try {
        const q = query(
            collection(db, 'users', userId, 'quizAttempts'),
            orderBy('timestamp', 'desc'),
            limit(5)
        );
        const querySnapshot = await getDocs(q);
        const seenQuestions = new Set<string>();
        querySnapshot.forEach(doc => {
            const attempt = doc.data();
            if (attempt.questions) {
                attempt.questions.forEach((question: any) => {
                    if(question && typeof question.question === 'string') {
                      seenQuestions.add(question.question);
                    }
                });
            }
        });
        return Array.from(seenQuestions);
    } catch (error: any) {
        if (error?.code !== 'permission-denied') {
            console.error("[getRecentQuestions] Error:", error);
        }
        return [];
    }
}

// ✅ UPDATED: Generate prompt text with enhanced requirements from Code-2
function buildPrompt(format: string, seenQuestions: string[]): string {
  const seenQuestionsText = seenQuestions.length > 0 
    ? seenQuestions.map(q => `- "${q}"`).join('\n')
    : '(No recent questions)';

  return `You are a world-class cricket expert and quizmaster. Generate a completely new 5-question multiple-choice quiz about "${format}" cricket.

The supported formats are:
- "IPL"
- "WPL"
- "Test"
- "T20"
- "ODI"
- "Mixed" (can combine all of the above)

## Core Requirements

### 1) Question Difficulty & Style
- ALL 5 questions must be EXTREMELY tough - designed for hardcore cricket analysts and experts.
- NO casual fan questions. Every question requires deep cricket knowledge.
- Focus on: obscure records, rare stats, niche tournaments, specific match situations, player milestones, venue history, rule edge cases.
- Examples of tough topics: economy rates under 5 overs, specific boundary counts in a match, rare bowling spells, venue-specific records, DLS calculations, format conversions, rule interpretations.

### 2) Category Coverage (MANDATORY - Cover ALL 5 categories)
Your 5 questions MUST span these exact categories:

1. **Score & Match Situations** - Exact figures, unusual chases, collapses, aggregates, strike rates, economy rates, century partnerships, rare scores
2. **Player Performance** - Career/season aggregates, specific spells, debut milestones, rare achievements, consecutive records, format-specific stats
3. **Venues & Conditions** - Ground dimensions, pitch behavior, venue records, boundary lengths, home advantage stats, weather impact
4. **Tournaments & Special Days** - Finals, knockouts, debut matches, anniversaries, iconic days, rule changes, first/last occurrences
5. **Strategy & Rules** - Rare rule applications, DLS situations, toss impact, format-specific quirks, captaincy decisions, unusual playing conditions

For "Mixed" format:
- Must span at least 3 different formats (IPL, WPL, Test, T20I, ODI).
- Explicitly mention the format in question text.

### 3) Non-Repetition Constraints (CRITICAL)
Previously seen questions in last 30 days:
\`\`\`
${seenQuestionsText}
\`\`\`

RULES:
- Do NOT generate questions similar to the above by meaning.
- Two questions are "similar" if they share:
  - Same specific match + same key statistic
  - Same player + same career/season record
  - Same venue + same record/achievement
  - Same tournament + same event/milestone

- ALLOWED: Reusing same match/player/venue IF asking about a completely different, distinct aspect.
- Each question in this quiz must be semantically unique and distinct from all others in the set.

### 4) Question Quality Standards
Each question MUST:
- Be factually accurate (verified stats, correct player names, accurate years, real venues).
- Be unambiguous and have only ONE correct interpretation.
- Have 4 plausible options that force real cricket knowledge to distinguish.
- Require at least 3-5 minutes of intense thinking for an expert to answer confidently.
- Include specific numbers, dates, or identifiable facts (not vague).

### 5) Output Format (STRICT JSON ONLY)

\`\`\`json
{
  "questions": [
    {
      "id": "q_\${Date.now()}_1",
      "format": "IPL | WPL | Test | T20 | ODI",
      "category": "score | player_performance | venue | tournament_or_special_day | strategy_or_rules",
      "question": "Your question text here?",
      "options": [
        "Option A",
        "Option B", 
        "Option C",
        "Option D"
      ],
      "correctAnswer": "Option A",
      "hint": "A short hint to help narrow down without giving it away",
      "explanation": "Detailed explanation with specific stats, context, and why other options are wrong"
    }
  ]
}
\`\`\`

FIELDS EXPLANATION:
- "id": Unique identifier for this question (use timestamp + index).
- "format": The actual cricket format. For mixed, must be one of the 5 formats.
- "category": Exactly one of the 5 categories listed in section 2.
- "question": The question text - must be very specific and detailed.
- "options": 4 plausible answers. Correct answer MUST exactly match one.
- "correctAnswer": MUST be word-for-word identical to one option.
- "hint": 1-2 sentence hint for an expert to think deeper.
- "explanation": 2-3 sentences explaining the answer with stats and context.

### 6) Strictest Rules (Non-negotiable)
✓ Return ONLY valid JSON - no markdown, no comments, no extra text.
✓ All 4 options must be plausible and tempting.
✓ correctAnswer must EXACTLY match one of the 4 options (case-sensitive).
✓ No question should repeat the same match/player more than once per quiz.
✓ For Mixed format: include format name in question or options.
✓ All stats and figures must be verifiable facts.
✓ No hypothetical or "what if" questions.
✓ Each category must appear at least once in the 5 questions.

### 7) Examples of Tough Questions (Reference Only)

**Example 1 - Score Category (IPL):**
"In IPL 2023, which team scored exactly 208/5 in a 20-over match at the Wankhede Stadium, with the opening pair contributing 87 runs in the first 8 overs before a collapse to 5/2?"
- This requires knowing exact match details, stadium, date, and player stats.

**Example 2 - Player Performance (Test):**
"In Test cricket, only 2 Indian batsmen have scored a century on debut. Name one of them."
- Requires deep knowledge of Indian cricket history.

**Example 3 - Venue (ODI):**
"The SCG in Sydney has a specific boundary dimension on one side. What is it?"
- Venue-specific knowledge.

**Example 4 - Tournament (IPL):**
"In which IPL season was the fewest number of sixes hit across all matches?"
- Requires cross-season comparison knowledge.

**Example 5 - Strategy/Rules (T20):**
"If a bowler bowls a no-ball in T20, how many runs are credited and what's the impact on the over?"
- Rule interpretation question.

Generate NOW. Return ONLY the JSON object with 5 questions covering all 5 categories.`;
}

export async function generateQuizFlow(input: GenerateQuizInput): Promise<z.infer<typeof QuizData>> {
    console.log(`[generateQuizFlow] 🎯 Starting for format: ${input.format}`);

    const seenQuestions = await getRecentQuestions(input.userId);
    console.log(`[generateQuizFlow] 📚 Found ${seenQuestions.length} recent questions`);
    
    try {
        console.log(`[generateQuizFlow] 🤖 Calling Gemini AI with model: ${MODEL_NAME}...`);
        const model = googleAI_SDK.getGenerativeModel({ 
          model: MODEL_NAME,
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        });

        const prompt = buildPrompt(input.format, seenQuestions);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`[generateQuizFlow] ✅ AI response received`);
        
        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in AI response");
        }
        
        const parsedData = JSON.parse(jsonMatch[0]);
        const validation = QuizData.safeParse(parsedData);
        
        if (!validation.success) {
             console.error("[generateQuizFlow] ❌ Validation failed:", validation.error.format());
             throw new Error("AI returned invalid quiz data");
        }

        console.log(`[generateQuizFlow] ✅ SUCCESS: Generated ${validation.data.questions.length} questions`);
        return validation.data;
        
    } catch (error: any) {
        console.error("[generateQuizFlow] ❌ Error:", error?.message || error);
        throw error;
    }
}
