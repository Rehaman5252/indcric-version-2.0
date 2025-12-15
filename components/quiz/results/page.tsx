'use client';

import React, { Suspense, useEffect, useState, memo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Sparkles, Eye, Ban, BadgeCheck, AlertTriangle } from 'lucide-react';
import type { QuizAttempt } from '@/ai/schemas';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const AnalysisDialog = dynamic(() => import('@/components/history/AnalysisDialog'));
const ReviewDialog = dynamic(() => import('@/components/history/ReviewDialog'));

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
 * Perfect Score Certificate Component
 */
const PerfectScoreCertificate = memo(
  ({
    userName,
    quizTitle,
    totalQuestions,
    correctAnswers,
  }: {
    userName: string;
    quizTitle: string;
    totalQuestions: number;
    correctAnswers: number;
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

            <div className="pt-6 border-t border-yellow-500/30">
              <p className="text-gray-400 text-xs italic">Officially Recognized Achievement</p>
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
  },
);

PerfectScoreCertificate.displayName = 'PerfectScoreCertificate';

const ResultsContent = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  const [sponsorName, setSponsorName] = useState<string>('CricBlitz');

  useEffect(() => {
    if (!attemptId) {
      setError('No quiz attempt ID found in the link.');
      setLoading(false);
      return;
    }
    if (!user) {
      toast({
        title: 'Not logged in',
        description: 'You need to be logged in to view results.',
        variant: 'destructive',
      });
      router.replace(`/auth/login?from=/quiz/results?attemptId=${attemptId}`);
      setLoading(false);
      return;
    }

    const fetchAttempt = async () => {
      if (!db) {
        setError('Database connection is not available.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const attemptDocRef = doc(db, 'users', user.uid, 'quizAttempts', attemptId);
        const attemptDoc = await getDoc(attemptDocRef);
        if (attemptDoc.exists()) {
          setAttempt(attemptDoc.data() as QuizAttempt);
        } else {
          setError(
            "We couldn't find the quiz data for this link. It might be expired or invalid.",
          );
        }
      } catch (err) {
        console.error('Failed to fetch quiz attempt:', err);
        setError('A server error occurred while fetching your results.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [attemptId, user, router, toast]);

  useEffect(() => {
    if (!attempt?.format || !user?.uid) return;

    const fetchSponsor = async () => {
      try {
        const adsRef = collection(db, 'ads');
        const q = query(
          adsRef,
          where('adSlot', '==', attempt.format),
          where('isActive', '==', true),
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const adDoc = querySnapshot.docs[0];
          const adData = adDoc.data();
          const companyName = (adData as any).companyName || 'CricBlitz';

          setSponsorName(companyName);
        } else {
          setSponsorName('CricBlitz');
        }
      } catch (err) {
        console.error('[Results] Error fetching sponsor:', err);
        setSponsorName('CricBlitz');
      }
    };

    fetchSponsor();
  }, [attempt?.format, user?.uid]);

  const handleViewAnswers = () => {
    setShowReviewDialog(true);
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
              {error || 'The attempt data is missing.'}
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

  // CRITICAL FIX: Check if perfect score (works for both string and number types)
  const scoreNum = Number(attempt.score);
  const totalNum = Number(attempt.totalQuestions);
  const isPerfectScore = scoreNum > 0 && scoreNum === totalNum;
  const isDisqualified = !!attempt.reason;

  console.log('🔍 CERTIFICATE DEBUG:', {
    score: attempt.score,
    scoreNum,
    totalQuestions: attempt.totalQuestions,
    totalNum,
    isPerfectScore,
    isDisqualified,
  });

  const getMotivationalLine = () => {
    if (isDisqualified)
      return { text: 'Fair play is key to the spirit of cricket.', emoji: '🤝' };
    if (isPerfectScore)
      return { text: "Flawless century! You're a true champion.", emoji: '🏆' };
    if (scoreNum >= 3)
      return { text: 'Good effort! Keep practicing.', emoji: '💪' };
    return {
      text: 'Tough match, but every game is a learning experience!',
      emoji: '👍',
    };
  };
  const motivationalLine = getMotivationalLine();
  const pageTitle = isDisqualified ? 'Disqualified' : isPerfectScore ? 'Perfect Score!' : 'Quiz Complete!';

  return (
    <PageWrapper title="Quiz Scorecard" showBackButton>
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
                      <span className="text-primary">{attempt.score}</span>/
                      {attempt.totalQuestions}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-primary">
                  {motivationalLine.text}
                </p>
              </>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <Button
                size="lg"
                variant="secondary"
                className="w-full h-14 text-base"
                onClick={() => router.push('/')}
              >
                <Home className="mr-2 h-5 w-5" /> Go Home
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

        {/* ✅ CERTIFICATE SECTION - WILL SHOW WHEN PERFECT SCORE */}
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
            />
          </motion.div>
        )}

        {!isDisqualified && (
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary" /> AI Performance Analysis
              </CardTitle>
              <CardDescription>
                Want to improve? Get a personalized analysis of your performance from our
                AI coach.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                className="w-full"
                onClick={() => setIsAnalysisOpen(true)}
              >
                Generate Free Analysis
              </Button>
            </CardContent>
          </Card>
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

export default function QuizResultsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ResultsContent />
    </Suspense>
  );
}