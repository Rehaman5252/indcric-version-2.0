'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { CricketLoading } from '@/components/CricketLoading';
import dynamic from 'next/dynamic';
import AuthGuard from '@/components/auth/AuthGuard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientOnly from '@/components/ClientOnly';
import { logger } from '@/app/lib/logger';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ChunkLoadError = () => (
  <div className="flex items-center justify-center min-h-screen p-4">
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Critical Error</AlertTitle>
      <AlertDescription>
        A core part of the quiz failed to load. Please refresh the page.
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </AlertDescription>
    </Alert>
  </div>
);

const QuizClient = dynamic(
  () =>
    import('@/components/quiz/QuizClient').catch((err) => {
      logger.error('Failed to load QuizClient chunk', { error: err });
      return () => <ChunkLoadError />;
    }),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <CricketLoading />
      </div>
    ),
    ssr: false,
  }
);

function QuizPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Only use format from URL – brand will be overwritten from Firebase
  const format = searchParams.get('format') || 'Mixed';

  const [userId, setUserId] = useState<string>('');
  const [sponsorName, setSponsorName] = useState<string>('CricBlitz');
  const [loadingQuiz, setLoadingQuiz] = useState(true);

  // 🔑 Get authenticated user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.uid) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ FETCH SPONSOR FROM ADS COLLECTION BASED ON QUIZ FORMAT
  //    AND UPDATE URL brand PARAM TO MATCH FIREBASE
  useEffect(() => {
    if (!format) {
      setLoadingQuiz(false);
      return;
    }

    const fetchSponsor = async () => {
      try {
        console.log('[Quiz Page] 📡 Fetching sponsor for format:', format);

        const adsRef = collection(db, 'ads');

        // Try exact match first, then "<format> League"
        const queries = [
          query(adsRef, where('adSlot', '==', format), where('isActive', '==', true)),
          query(
            adsRef,
            where('adSlot', '==', `${format} League`),
            where('isActive', '==', true)
          ),
        ];

        let querySnapshot = await getDocs(queries[0]);

        if (querySnapshot.empty) {
          console.log(
            `[Quiz Page] ⚠️ No exact match for format: "${format}", trying with " League" suffix...`
          );
          querySnapshot = await getDocs(queries[1]);
        }

        if (!querySnapshot.empty) {
          const adDoc = querySnapshot.docs[0];
          const adData = adDoc.data();
          const companyName = adData.companyName || 'CricBlitz';

          setSponsorName(companyName);
          console.log(
            '[Quiz Page] ✅ Sponsor fetched:',
            companyName,
            'for format:',
            format
          );
          console.log('[Quiz Page] 📋 Full ad data:', adData);

          // 🔁 NEW: sync URL brand param with Firebase sponsor
          try {
            const current = new URLSearchParams(Array.from(searchParams.entries()));
            current.set('brand', companyName); // overwrite brand in URL
            const qs = current.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
          } catch (e) {
            console.warn('[Quiz Page] URL update failed', e);
          }
        } else {
          setSponsorName('CricBlitz');
          console.log(
            '[Quiz Page] ⚠️ No active ad found for format:',
            format,
            '- using fallback'
          );
        }
      } catch (err) {
        console.error('[Quiz Page] ❌ Error fetching sponsor:', err);
        setSponsorName('CricBlitz');
      } finally {
        setLoadingQuiz(false);
      }
    };

    fetchSponsor();
  }, [format, pathname, router, searchParams]);

  if (!format) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CricketLoading />
      </div>
    );
  }

  if (loadingQuiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CricketLoading />
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="max-w-6xl mx-auto">
        {/* ✅ PASS SPONSOR NAME (sponsorName) AS brand PROP TO QUIZ CLIENT */}
        <QuizClient brand={sponsorName} format={format} />
      </div>
    </ClientOnly>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <CricketLoading />
        </div>
      }
    >
      <AuthGuard>
        <QuizPageContent />
      </AuthGuard>
    </Suspense>
  );
}
