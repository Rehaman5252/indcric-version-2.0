'use client';

import { useEffect, useState } from 'react';
import RewardsContent from '@/components/rewards/RewardsContent';
import RewardsTour from '@/components/rewards/RewardsTour';
import { useAuth } from '@/context/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';

const REWARDS_TOUR_KEY = 'indcric-rewards-tour-shown';
const START_FLAG_KEY = 'indcric-start-rewards-tour';

export default function RewardsPageClient() {
  const { profile } = useAuth();
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const localSeen =
      typeof window !== 'undefined' &&
      window.localStorage.getItem(REWARDS_TOUR_KEY) === 'true';

    const startFlag =
      typeof window !== 'undefined' &&
      window.localStorage.getItem(START_FLAG_KEY) === 'true';

    // Run tour if user was just sent from home tour and has not seen rewards tour yet
    if (startFlag && !localSeen) {
      setRunTour(true);
      // clear the start flag so it doesn't auto-run on future manual visits
      window.localStorage.removeItem(START_FLAG_KEY);
    }
  }, [profile]);

  const handleRewardsTourFinish = () => {
    setRunTour(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(REWARDS_TOUR_KEY, 'true');
    }
  };

  if (!profile) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <>
      <RewardsTour run={runTour} onFinish={handleRewardsTourFinish} />
      <RewardsContent />
    </>
  );
}