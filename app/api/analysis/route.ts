import { NextResponse } from "next/server";
import { generateQuizAnalysis } from "@/ai/flows/generate-quiz-analysis";
import { QuizAnalysisOutputSchema, QuizAttempt } from "@/ai/schemas";
import type { QuizAnalysisOutput, QuizAttempt as QuizAttemptType } from "@/ai/schemas";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@/app/lib/logger";

const getFallbackAnalysisForApi = (attempt: any): QuizAnalysisOutput => {
  const format = attempt?.format || "cricket";
  const score = attempt?.score ?? "a good";
  const total = attempt?.totalQuestions ?? "your";
  return {
    summary: `A solid effort on the ${format} quiz! You scored ${score} out of ${total}. We're showing general feedback as the AI coach is unavailable.`,
    strengths: ["Consistency in completing quizzes.", "Willingness to learn and improve."],
    weaknesses: ["Potential gaps in specific eras or player stats.", "Time management on difficult questions."],
    recommendations: [
      "Review questions you were unsure about.",
      "Focus on one cricket format to build deep knowledge.",
      "Try to answer questions you're confident about more quickly."
    ],
    source: "fallback",
  };
};

/** Converts QuizAttempt (questions/options/userAnswers) into analysis shape */
function transformAttemptForAnalysis(attempt: QuizAttemptType) {
  const { questions, userAnswers } = attempt;
  // Make an array of { question, correctAnswer, userAnswer, isCorrect }
  const answered = questions.map((q, idx) => ({
    question: q.question,
    correctAnswer: q.correctAnswer,
    userAnswer: userAnswers[idx] ?? "",
    isCorrect: userAnswers[idx] === q.correctAnswer,
  }));
  return {
    ...attempt,
    questions: answered,  // replaces original array of full question objects
    // Optionally omit userAnswers if your AI flow expects only 'questions'
    // Remove fields not needed for AI input if required
  };
}

export async function POST(req: Request) {
  const requestId = uuidv4();
  let attemptBody: any;

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || !body.attempt) {
      logger.warn(`[Analysis] Invalid request body.`, { requestId });
      return NextResponse.json(
        { ok: false, analysis: getFallbackAnalysisForApi({}), requestId },
        { status: 400 }
      );
    }

    attemptBody = body.attempt;

    try {
      // Validate and cast attempt to your QuizAttempt type
      const parsedAttempt = QuizAttempt.safeParse(attemptBody);
      if (!parsedAttempt.success) {
        throw new Error("Invalid quiz attempt data");
      }
      // Transform QuizAttempt to format expected by the analysis function
      const analysisInput = transformAttemptForAnalysis(parsedAttempt.data);
      const analysis = await generateQuizAnalysis(analysisInput);

      // Final validation before sending to client
      const parsed = QuizAnalysisOutputSchema.safeParse(analysis);

      if (!parsed.success) {
        logger.error(
          `[Analysis AI Error] reqId=${requestId} - AI output failed validation`,
          { error: parsed.error, userId: analysisInput.userId }
        );
        // Fall through to static fallback
      } else {
        logger.info(
          `[Analysis] Successfully generated analysis.`,
          { requestId, source: parsed.data.source, userId: analysisInput.userId }
        );
        return NextResponse.json({ ok: true, analysis: parsed.data, requestId });
      }
    } catch (aiError: any) {
      logger.error(`[Analysis AI Exception] reqId=${requestId}`, {
        error: aiError.message,
        userId: attemptBody?.userId,
      });
      // Fall through to static fallback
    }

    // Fallback case
    logger.warn(`[Analysis] Serving fallback analysis.`, {
      requestId,
      userId: attemptBody?.userId,
    });
    const fallbackAnalysis = getFallbackAnalysisForApi(attemptBody);
    return NextResponse.json({
      ok: true,
      analysis: fallbackAnalysis,
      fallback: true,
      requestId,
    });
  } catch (err: any) {
    logger.error(
      `[Analysis Route Error] reqId=${requestId}`,
      { error: err.message }
    );
    return NextResponse.json(
      { ok: false, error: "Invalid request body.", requestId },
      { status: 400 }
    );
  }
}
