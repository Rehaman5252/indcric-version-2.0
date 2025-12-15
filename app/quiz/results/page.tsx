'use client';

import React, { Suspense, useEffect, useState, memo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Sparkles, Eye, Ban, BadgeCheck, AlertTriangle, TrendingUp, Target, Lightbulb } from 'lucide-react';
import type { QuizAttempt } from '@/ai/schemas';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { decodeAttempt } from '@/lib/quiz-utils';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthProvider';
import { createPaymentRequest } from '@/lib/payment-service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const AnalysisDialog = dynamic(
  () => import('@/components/history/AnalysisDialog'),
  { ssr: false }
);
const ReviewDialog = dynamic(
  () => import('@/components/history/ReviewDialog'),
  { ssr: false }
);

interface QuizAnalysis {
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
}

const LoadingSkeleton = () => (
  <PageWrapper title="Loading Results...">
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-40 w-full" />
      <div className="space-y-3 pt-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  </PageWrapper>
);

/**
 * ✅ Helper function to calculate quiz slot from Firestore timestamp
 * Same logic style as history: converts timestamp to 10-minute slot
 * Supports: Firestore Timestamp, {seconds}, millis number, Date
 */
const calculateQuizSlotFromTimestamp = (ts: any): string => {
  if (!ts) {
    console.log('[calculateQuizSlot] ❌ No timestamp provided');
    return 'N/A';
  }

  let date: Date | null = null;

  try {
    // Firestore Timestamp object (has toDate())
    if (ts && typeof ts.toDate === 'function') {
      date = ts.toDate();
      console.log('[calculateQuizSlot] ✅ Converted Firestore Timestamp');
    }
    // Plain Timestamp-like object { seconds: number }
    else if (typeof ts?.seconds === 'number') {
      date = new Date(ts.seconds * 1000);
      console.log('[calculateQuizSlot] ✅ Converted {seconds} object');
    }
    // Milliseconds number
    else if (typeof ts === 'number') {
      date = new Date(ts);
      console.log('[calculateQuizSlot] ✅ Converted millis number');
    }
    // Already a JS Date
    else if (ts instanceof Date) {
      date = ts;
      console.log('[calculateQuizSlot] ✅ Already a Date object');
    }

    if (!date) {
      console.log('[calculateQuizSlot] ⚠️ Could not convert timestamp to Date');
      return 'N/A';
    }

    const hours = date.getHours();
    const minutes = date.getMinutes();

    console.log('[calculateQuizSlot] 🕐 Extracted time:', `${hours}:${minutes}`);

    // Round down to nearest 10-minute window
    const slotStartMinutes = Math.floor(minutes / 10) * 10;
    const slotEndMinutes = slotStartMinutes + 10;

    let slotEndHours = hours;
    if (slotEndMinutes >= 60) {
      slotEndHours = (hours + 1) % 24;
    }

    const formatTime = (h: number, m: number) => {
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHours = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${displayHours}:${m.toString().padStart(2, '0')} ${period}`;
    };

    const startStr = formatTime(hours, slotStartMinutes);
    const endStr = formatTime(slotEndHours, slotEndMinutes % 60);
    const result = `${startStr} - ${endStr}`;

    console.log('[calculateQuizSlot] ✅ Final slot:', result);
    return result;
  } catch (e) {
    console.error('[calculateQuizSlot] ❌ Error:', e);
    return 'N/A';
  }
};

/**
 * Perfect Score Certificate Component
 */
const PerfectScoreCertificate = memo(
  ({
    userName,
    quizTitle,
    totalQuestions,
    correctAnswers,
    awardedDate,
    quizSlot,
  }: {
    userName: string;
    quizTitle: string;
    totalQuestions: number;
    correctAnswers: number;
    awardedDate: string;
    quizSlot: string;
  }) => {
    const certificateRef = useRef<HTMLDivElement>(null);

    const downloadCertificate = async () => {
      if (!certificateRef.current) return;

      try {
        const canvas = await html2canvas(certificateRef.current, {
          backgroundColor: '#1a1a1a',
          scale: 2,
        });

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        pdf.save(`certificate-${userName}-${quizTitle}.pdf`);
      } catch (error) {
        console.error('Error downloading certificate:', error);
      }
    };

    const scorePercentage =
      totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    return (
      <div className="w-full space-y-6">
        {/* Certificate Card */}
        <div
          ref={certificateRef}
          className="max-w-2xl mx-auto relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-8 border-4 border-yellow-500/70 shadow-2xl"
        >
          {/* Corners */}
          <div className="absolute top-6 left-6 text-5xl animate-pulse">⭐</div>
          <div className="absolute top-6 right-6 text-5xl animate-pulse">⭐</div>
          <div className="absolute bottom-6 left-6 text-5xl animate-pulse">⭐</div>
          <div className="absolute bottom-6 right-6 text-5xl animate-pulse">⭐</div>

          <div className="text-center space-y-6 py-12 px-8">
            <div className="space-y-2">
              <p className="text-yellow-500 font-semibold text-lg tracking-widest">
                Certificate of Achievement
              </p>
              <p className="text-gray-300 text-sm">This certifies that</p>
            </div>

            <h2 className="text-5xl font-bold text-yellow-400 drop-shadow-lg">{userName}</h2>

            <div className="space-y-3">
              <p className="text-gray-300 text-base">
                has successfully achieved a perfect score in the
              </p>
              <h3 className="text-4xl font-bold text-white">{quizTitle}</h3>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Score</p>
                  <p className="text-2xl font-bold text-yellow-400">{scorePercentage}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Questions Correct</p>
                  <p className="text-2xl font-bold text-green-400">
                    {correctAnswers}/{totalQuestions}
                  </p>
                </div>
              </div>
            </div>

            {/* Date and Time Slot Section */}
            <div className="space-y-2 pt-4">
              <p className="text-gray-300 text-sm">
                <span className="text-gray-400">Awarded on: </span>
                <span className="text-yellow-400 font-semibold">{awardedDate}</span>
              </p>
              <p className="text-gray-300 text-sm">
                <span className="text-gray-400">Quiz Slot: </span>
                <span className="text-yellow-400 font-semibold">{quizSlot}</span>
              </p>
            </div>

            <div className="pt-6 border-t border-yellow-500/30">
              <p className="text-gray-400 text-xs italic">Officially Recognized Achievement by Indcric</p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="max-w-2xl mx-auto flex gap-4 justify-center">
          <button
            onClick={downloadCertificate}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Certificate
          </button>
        </div>
      </div>
    );
  }
);

PerfectScoreCertificate.displayName = 'PerfectScoreCertificate';

const ResultsContent = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const audioRef = useRef<HTMLAudioElement | null>(null); // 👈 Audio ref

  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentCreated, setPaymentCreated] = useState(false);

  const [aiAnalysis, setAiAnalysis] = useState<QuizAnalysis | null>(null);

  const [sponsorName, setSponsorName] = useState<string>('CricBlitz');

  const [attempt, setAttempt] = useState<QuizAttempt | null>(() => {
    const attemptData = searchParams.get('attempt');
    if (!attemptData) return null;
    return decodeAttempt(attemptData);
  });

  // ✅ Fetch sponsor from ads collection based on quiz format
  useEffect(() => {
    if (!attempt?.format || !user?.uid) return;

    const fetchSponsor = async () => {
      try {
        console.log('[Results] 📡 Fetching sponsor for quiz format:', attempt.format);

        const adsRef = collection(db, 'ads');
        const q = query(
          adsRef,
          where('adSlot', '==', attempt.format),
          where('isActive', '==', true)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const adDoc = querySnapshot.docs[0];
          const adData = adDoc.data();
          const companyName = adData.companyName || 'CricBlitz';

          setSponsorName(companyName);
          console.log('[Results] ✅ Sponsor found:', companyName, 'for slot:', attempt.format);
        } else {
          setSponsorName('CricBlitz');
          console.log('[Results] ⚠️ No active ad found for format:', attempt.format, '- using fallback');
        }
      } catch (err) {
        console.error('[Results] ❌ Error fetching sponsor:', err);
        setSponsorName('CricBlitz');
      }
    };

    fetchSponsor();
  }, [attempt?.format, user?.uid]);

  // Load AI analysis from sessionStorage
  useEffect(() => {
    if (!attempt) return;

    const analysisKey = `quiz-analysis-${attempt.slotId}`;
    const storedAnalysis = sessionStorage.getItem(analysisKey);

    console.log('[Results] 🔍 Looking for analysis with key:', analysisKey);
    console.log('[Results] 📦 Found stored analysis:', storedAnalysis);

    if (storedAnalysis) {
      try {
        const parsedAnalysis = JSON.parse(storedAnalysis) as QuizAnalysis;
        console.log('[Results] ✅ Parsed analysis:', parsedAnalysis);
        setAiAnalysis(parsedAnalysis);
      } catch (parseErr) {
        console.error('[Results] ❌ Failed to parse stored analysis:', parseErr);
      }
    } else {
      console.log('[Results] ⚠️ No analysis found in sessionStorage');
    }
  }, [attempt]);

  // Create payment request for perfect score
  // Create payment request for perfect score
useEffect(() => {
  if (!attempt || !user) return;
  if (paymentCreated) return;

  const scoreNum = Number(attempt.score);
  const totalNum = Number(attempt.totalQuestions);
  const isPerfectScore = scoreNum > 0 && scoreNum === totalNum;
  const isDisqualified = !!attempt.reason;

  if (!isPerfectScore || isDisqualified) return;

  const handlePaymentCreation = async () => {
    try {
      // ✅ USE STABLE QUIZ ID (slotId or any unique field inside attempt)
      const quizId =
        (attempt as any).slotId ||
        searchParams.get('attemptId') ||
        'unknown_quiz';

      const paymentId = await createPaymentRequest(
        user.uid,
        quizId,
        scoreNum,
        totalNum
      );

      if (paymentId) {
        setPaymentCreated(true);
        toast({
          title: '🎉 Congratulations!',
          description:
            "You've earned ₹100! Payment request has been submitted to admin for processing.",
          duration: 8000,
        });
        console.log('✅ Payment request created or reused:', paymentId);
      }
    } catch (error) {
      console.error('Error creating payment request:', error);
    }
  };

  handlePaymentCreation();
}, [attempt, user, searchParams, toast, paymentCreated]);


  useEffect(() => {
    if (attempt) {
      setLoading(false);
      return;
    }

    const attemptId = searchParams.get('attemptId');
    if (!attemptId) {
      setError('No quiz data found in the URL.');
      setLoading(false);
      return;
    }

    if (!user) {
      return;
    }

    const fetchAttemptFromDB = async () => {
      if (!db) {
        setError('Database connection unavailable.');
        setLoading(false);
        return;
      }
      try {
        const attemptRef = doc(db, 'users', user.uid, 'quizAttempts', attemptId);
        const docSnap = await getDoc(attemptRef);
        if (docSnap.exists()) {
          setAttempt(docSnap.data() as QuizAttempt);
        } else {
          setError('Could not find the specified quiz result.');
        }
      } catch (e) {
        console.error('Error fetching attempt from DB:', e);
        setError('Failed to fetch quiz results from the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptFromDB();
  }, [searchParams, user, attempt]);

  const handleViewAnswers = () => {
    if (!attempt) return;
    if (attempt.reviewed) {
      setShowReviewDialog(true);
    } else {
      toast({
        title: 'Review Your Answers in History',
        description:
          'You can watch a short ad from the History page to unlock the answers for this quiz.',
        duration: 7000,
      });
      router.push('/history');
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !attempt) {
    return (
      <PageWrapper title="Error">
        <Card className="text-center">
          <CardHeader>
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-destructive">
              Could Not Load Quiz Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              {error || 'There was an error decoding your results.'}
            </p>
            <Button onClick={() => router.push('/')}>
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  const scoreNum = Number(attempt.score);
  const totalNum = Number(attempt.totalQuestions);
  const isPerfectScore = scoreNum > 0 && scoreNum === totalNum;
  const isDisqualified = !!attempt.reason;
  const hasAiAnalysis = aiAnalysis && aiAnalysis.overallFeedback;

  const getMotivationalLine = () => {
    if (isDisqualified) return { text: 'Fair play is key to the spirit of cricket.', emoji: '🤝' };
    if (isPerfectScore)
      return { text: "Flawless century! You're a true champion. You've earned ₹100!", emoji: '🏆' };
    if (scoreNum >= 3) return { text: 'Good effort! Keep practicing.', emoji: '💪' };
    return { text: 'Tough match, but every game is a learning experience!', emoji: '👍' };
  };
  const motivationalLine = getMotivationalLine();
  const pageTitle = isDisqualified ? 'Disqualified' : isPerfectScore ? 'Perfect Score!' : 'Quiz Complete!';

  // Format date for certificate
  const submittedAtValue = (attempt as any)?.submittedAt as string | number | Date | undefined;

  const awardedDate =
    submittedAtValue
      ? new Date(submittedAtValue).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

  // ✅ USE TIMESTAMP FIELD (same as history)
  const timestamp = (attempt as any)?.timestamp as any;
  const quizSlot = calculateQuizSlotFromTimestamp(timestamp);

  console.log('[Results] 🎯 Full Attempt data:', attempt);
  console.log('[Results] 🕒 Raw timestamp from attempt:', timestamp);
  console.log('[Results] 📍 Calculated quiz slot:', quizSlot);

  return (
    <PageWrapper title="Quiz Scorecard" showBackButton>
      {/* 🔊 Hidden audio element for perfect-score sound */}
      <audio
        ref={audioRef}
        src="/perfect.mp3"
        preload="auto"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="space-y-6"
      >
        <Card className="text-center shadow-lg bg-card/80 overflow-hidden border-none">
          <CardContent className="p-6 space-y-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto bg-primary/10 p-4 rounded-full w-fit"
            >
              {isDisqualified ? (
                <Ban className="h-12 w-12 text-destructive" />
              ) : isPerfectScore ? (
                <span className="text-5xl">💰</span>
              ) : (
                <span className="text-5xl">🏆</span>
              )}
            </motion.div>

            <div className="space-y-1">
              <h1 className="text-3xl font-bold">{pageTitle}</h1>
              <p className="text-muted-foreground">
                {attempt.format} Quiz - Sponsored by {sponsorName}
              </p>
            </div>

            {!isDisqualified && (
              <>
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <BadgeCheck className="h-8 w-8 text-primary mx-auto mb-1" />
                    <p className="text-muted-foreground text-sm">You Scored</p>
                    <p className="text-5xl font-bold tracking-tighter">
                      <span className="text-primary">{scoreNum}</span>/{totalNum}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-primary">{motivationalLine.text}</p>

                {isPerfectScore && (
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">
                        ₹100 Reward!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your payment request has been submitted to the admin. You will receive your
                        reward shortly.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <Button
                size="lg"
                variant="secondary"
                className="w-full h-14 text-base"
                onClick={() => {
                  if (isPerfectScore && !isDisqualified && audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(console.error);
                  }
                  router.push('/');
                }}
              >
                <Home className="mr-2 h-4 w-4" /> Go Home
              </Button>
              {!isDisqualified && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-14 text-base"
                  onClick={handleViewAnswers}
                >
                  <Eye className="mr-2 h-5 w-5" /> View Answers
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ✅ AI ANALYSIS CARD - ALWAYS SHOW GENERATE BUTTON */}
        {!isDisqualified && (
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary" /> AI Performance Analysis
              </CardTitle>
              <CardDescription>
                Want to improve? Get a personalized analysis of your performance from our AI coach.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button
                size="lg"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                onClick={() => setIsAnalysisOpen(true)}
              >
                Generate Free Analysis
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ✅ CERTIFICATE SECTION - AFTER ANALYSIS */}
        {isPerfectScore && !isDisqualified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4 w-full"
          >
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-4">
                🏆 You&apos;ve unlocked your achievement certificate!
              </p>
            </div>
            <PerfectScoreCertificate
              userName={user?.displayName || 'Player'}
              quizTitle={attempt.format}
              totalQuestions={totalNum}
              correctAnswers={scoreNum}
              awardedDate={awardedDate}
              quizSlot={quizSlot}
            />
          </motion.div>
        )}
      </motion.div>

      {attempt && (
        <AnalysisDialog
          open={isAnalysisOpen}
          onOpenChange={setIsAnalysisOpen}
          attempt={attempt}
        />
      )}

      {attempt && (
        <ReviewDialog
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          attempt={attempt}
        />
      )}
    </PageWrapper>
  );
};

export default function QuizResultsWrapperPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ResultsContent />
    </Suspense>
  );
}
