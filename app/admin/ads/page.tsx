'use client';

import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdUploadForm from '@/app/components/admin/AdUploadForm';
import AdsList from '@/app/components/admin/AdsList';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  XCircle,
  Trash2,
} from 'lucide-react';

interface Ad {
  id: string;
  companyName: string;
  adSlot: string;
  adType: 'image' | 'video';
  mediaUrl: string;
  redirectUrl: string;
  revenue: number;
  viewCount: number;
  clickCount: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

interface RevenueRecord {
  id: string;
  adId: string;
  adName: string;
  amount: number;
  timestamp: any;
  type: 'created' | 'updated';
}

interface DeletedAd extends Ad {
  deletedAt: any;
  reasonForDeletion?: string;
}

export default function AdUploadPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    totalAds: 0,
    activeAds: 0,
    deactivatedAds: 0,
    deletedAds: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch active ads
        const adsSnapshot = await getDocs(collection(db, 'ads'));
        const adsData = adsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Ad[];

        // Fetch deleted ads
        const deletedSnapshot = await getDocs(collection(db, 'deletedAds'));
        const deletedAdsCount = deletedSnapshot.size;

        // Fetch revenue history (permanent record of all revenue)
        const revenueSnapshot = await getDocs(collection(db, 'revenueHistory'));
        const revenueRecords = revenueSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as RevenueRecord[];

        // Calculate total revenue from history (never decreases)
        const totalRevenue = revenueRecords.reduce(
          (sum, record) => sum + (record.amount || 0),
          0
        );

        const activeAds = adsData.filter(ad => ad.isActive).length;
        const deactivatedAds = adsData.filter(ad => !ad.isActive).length;

        setStats({
          totalAds: adsData.length,
          activeAds,
          deactivatedAds,
          deletedAds: deletedAdsCount,
          totalRevenue,
        });

        console.log('📊 Stats loaded:', {
          totalAds: adsData.length,
          activeAds,
          deactivatedAds,
          deletedAds: deletedAdsCount,
          totalRevenue,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [refreshKey]);

  return (
    <AdminAuthGuard requiredPermissions={['ads:manage']}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-white mb-2">
            🎬 Ads Management
          </h1>
          <p className="text-gray-400">
            Upload, manage, and track advertisement campaigns
          </p>
        </div>

        {/* Analytics Dashboard */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            📊 Analytics Dashboard
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Total Ads Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  🎯 Total Ads
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {stats.totalAds}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All advertisements
                </p>
              </CardContent>
            </Card>

            {/* Active Ads Card */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  ✅ Active Ads
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {stats.activeAds}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently running
                </p>
              </CardContent>
            </Card>

            {/* Deactivated Ads Card */}
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800 hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  ⏸️ Deactivated
                </CardTitle>
                <XCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                  {stats.deactivatedAds}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Temporarily paused
                </p>
              </CardContent>
            </Card>

            {/* Deleted Ads Card */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800 hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  🗑️ Deleted
                </CardTitle>
                <Trash2 className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                  {stats.deletedAds}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Archived ads
                </p>
              </CardContent>
            </Card>

            {/* Total Revenue Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  💰 Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  ₹{stats.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time (permanent)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hint Ads */}
          <div className="bg-amber-500/10 border border-amber-500 rounded-lg p-4">
            <p className="text-sm font-semibold text-amber-400 mb-2">
              💡 Hint Ad Slots (5)
            </p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Q1_HINT – shown before Hint for Question 1</li>
              <li>• Q2_HINT – shown before Hint for Question 2</li>
              <li>• Q3_HINT – shown before Hint for Question 3</li>
              <li>• Q4_HINT – shown before Hint for Question 4</li>
              <li>• Q5_HINT – shown before Hint for Question 5</li>
            </ul>
          </div>

          {/* Revenue Info */}
          <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-400 mb-2">
              📈 Revenue System (Permanent)
            </p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>✅ Revenue never decreases</li>
              <li>✅ Deleting ads doesn't reduce total</li>
              <li>✅ Replacing ads adds new revenue</li>
              <li>✅ Complete history preserved</li>
            </ul>
          </div>
        </div>

        {/* Upload Form Section */}
        <div>
          <AdUploadForm onSuccess={() => setRefreshKey(prev => prev + 1)} />
        </div>

        {/* Ads List - Clean and Simple */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            📋 All Advertisements
          </h2>
          <AdsList
            key={refreshKey}
            onUpdate={() => setRefreshKey(prev => prev + 1)}
          />
        </div>
      </div>
    </AdminAuthGuard>
  );
}