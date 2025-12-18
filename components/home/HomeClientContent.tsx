// app/components/home/HomeClientContent.tsx

'use client';

import React, { memo } from 'react';
import { useAuth } from '@/context/AuthProvider';
import type { CubeBrand } from '@/components/home/brandData';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const QuizSelection = dynamic(() => import('@/components/home/QuizSelection'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false,
});

const GuidedTour = dynamic(() => import('@/components/home/GuidedTour'), {
  ssr: false,
});

interface HomeClientContentProps {
  selectedBrand: CubeBrand;
  setSelectedBrand: React.Dispatch<React.SetStateAction<CubeBrand>>;
  handleStartQuiz: (brand: CubeBrand) => void;
}

const HomeClientContentComponent = ({
  selectedBrand,
  setSelectedBrand,
  handleStartQuiz,
}: HomeClientContentProps) => {
  const { profile, updateUserData } = useAuth();

  const needsTour = !!profile && !profile.guidedTourCompleted;

  const handleTourFinish = async () => {
    if (!profile) return;
    try {
      await updateUserData({ guidedTourCompleted: true });
    } catch (error) {
      console.error('Failed to update tour status:', error);
    }
  };

  return (
    <>
      {profile && (
        <GuidedTour run={needsTour} onFinish={handleTourFinish} />
      )}

      <div className="space-y-6">
        {/* Step 1 – quiz format cube and selection */}
        <div id="tour-step-1">
          <QuizSelection
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            handleStartQuiz={handleStartQuiz}
          />
        </div>

        

        {/* Step 3/4 – bottom navigation (make sure IDs match nav buttons) */}
        <div id="tour-step-3">
          {/* Your actual bottom nav is probably outside this component; 
              ensure the Rewards tab button has id="nav-rewards-tab" */}
        </div>
      </div>
    </>
  );
};

export default memo(HomeClientContentComponent);