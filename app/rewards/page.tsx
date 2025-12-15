import { Suspense } from 'react';
import RewardsContent from '@/components/rewards/RewardsContent';
import { Skeleton } from '@/components/ui/skeleton';


export const metadata = {
  title: 'Rewards | Ind Cric',
  description: 'View your rewards and exclusive partner offers',
};


export default function RewardsPage() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-8">
      {/* Full-width header */}
      <header className="px-4">
        <h1 className="text-3xl font-bold text-foreground">Rewards</h1>
      </header>

      {/* Full-width content, only small horizontal padding */}
      <div className="mt-4 px-4">
        <Suspense fallback={<RewardsSkeleton />}>
          <RewardsContent />
        </Suspense>
      </div>
    </main>
  );
}


function RewardsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4]" />
        ))}
      </div>
    </div>
  );
}