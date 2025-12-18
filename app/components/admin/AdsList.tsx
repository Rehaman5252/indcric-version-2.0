'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Loader, Eye, EyeOff, Upload } from 'lucide-react';
import { 
  getAllAds, 
  deleteAd, 
  updateAd,
  type Ad,
} from '@/lib/ad-service';
import { toast } from 'sonner';
import Link from 'next/link';

type TabType = 'cube' | 'quiz' | 'hints';
type SortType = 'active' | 'inactive' | 'all';

interface AdListProps {
  onUpdate?: () => void;
}

const CUBE_FACES = ['T20', 'IPL', 'ODI', 'WPL', 'Test', 'Mixed'];
const QUIZ_FLOWS = ['Q1_Q2', 'Q2_Q3', 'Q3_Q4', 'Q4_Q5', 'AfterQuiz'];
const HINT_ADS = ['Q1_HINT', 'Q2_HINT', 'Q3_HINT', 'Q4_HINT', 'Q5_HINT'];

export default function AdsList({ onUpdate }: AdListProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('cube');
  const [sortBy, setSortBy] = useState<SortType>('all');

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      setLoading(true);
      const allAds = await getAllAds();
      setAds(allAds);
    } catch (error) {
      console.error('Error loading ads:', error);
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (ad: Ad) => {
    try {
      setToggling(ad.id);
      await updateAd(ad.id, {
        ...ad,
        isActive: !ad.isActive,
      });
      
      // Update local state
      setAds(prev =>
        prev.map(a =>
          a.id === ad.id ? { ...a, isActive: !a.isActive } : a
        )
      );

      toast.success(
        `Ad ${!ad.isActive ? 'activated' : 'deactivated'} successfully`
      );
      onUpdate?.();
    } catch (error) {
      console.error('Error toggling ad status:', error);
      toast.error('Failed to update ad status');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (adId: string) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) {
      return;
    }

    try {
      setDeleting(adId);
      await deleteAd(adId);
      toast.success('Ad deleted successfully (revenue preserved)');
      setAds(prev => prev.filter(ad => ad.id !== adId));
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Failed to delete ad');
    } finally {
      setDeleting(null);
    }
  };

  // Filter ads by tab
  const getFilteredAds = () => {
    let filtered = ads;

    // Filter by tab
    if (activeTab === 'cube') {
      filtered = filtered.filter(ad => CUBE_FACES.includes(ad.adSlot));
    } else if (activeTab === 'quiz') {
      filtered = filtered.filter(ad => QUIZ_FLOWS.includes(ad.adSlot));
    } else if (activeTab === 'hints') {
      filtered = filtered.filter(ad => HINT_ADS.includes(ad.adSlot));
    }

    // Filter by status
    if (sortBy === 'active') {
      filtered = filtered.filter(ad => ad.isActive);
    } else if (sortBy === 'inactive') {
      filtered = filtered.filter(ad => !ad.isActive);
    }

    return filtered;
  };

  const filteredAds = getFilteredAds();
  const activeCount = filteredAds.filter(ad => ad.isActive).length;
  const inactiveCount = filteredAds.filter(ad => !ad.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Add Button */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg">
                  📺
                </span>
                All Advertisements
              </h1>
              <p className="text-gray-400 text-sm mt-1">Manage and monitor your active ad campaigns</p>
            </div>
            
            {/* Add Advertisement Button */}
            <Link href="/admin/ads/upload">
              <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-6 rounded-lg flex items-center gap-2 text-lg shadow-lg hover:shadow-xl transition-all duration-200">
                <Upload className="h-5 w-5" />
                <span>Add Advertisement</span>
                <span className="ml-2 text-sm opacity-75">({ads.length})</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 bg-black/50 border border-yellow-600/30 rounded-lg p-2">
          <button
            onClick={() => setActiveTab('cube')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'cube'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }`}
          >
            🎲 Cube Faces (6)
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }`}
          >
            ❓ Quiz Flows (5)
          </button>
          <button
            onClick={() => setActiveTab('hints')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'hints'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }`}
          >
            💡 Hint Ads (5)
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSortBy('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              sortBy === 'all'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All ({filteredAds.length})
          </button>
          <button
            onClick={() => setSortBy('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              sortBy === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Eye className="h-4 w-4" /> Active ({activeCount})
          </button>
          <button
            onClick={() => setSortBy('inactive')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              sortBy === 'inactive'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <EyeOff className="h-4 w-4" /> Inactive ({inactiveCount})
          </button>
        </div>

        {/* Ads Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader className="h-8 w-8 animate-spin text-yellow-500" />
              <p className="text-gray-400">Loading advertisements...</p>
            </div>
          </div>
        ) : filteredAds.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 text-lg">No ads found in this category</p>
              <p className="text-gray-500 text-sm mt-2">Try selecting a different tab or filter</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map(ad => (
              <Card
                key={ad.id}
                className={`relative border transition-all duration-200 overflow-hidden ${
                  ad.isActive
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-green-600/50 hover:border-green-500'
                    : 'bg-gradient-to-br from-gray-900 to-black border-gray-700/50 hover:border-gray-600'
                }`}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  {ad.isActive ? (
                    <Badge className="bg-green-600/90 text-white hover:bg-green-700 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Active
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-700/90 text-gray-200 hover:bg-gray-800 flex items-center gap-1">
                      <EyeOff className="h-3 w-3" /> Inactive
                    </Badge>
                  )}
                </div>

                <CardContent className="pt-6 pb-6">
                  <div className="space-y-4">
                    
                    {/* Company Name */}
                    <div>
                      <h3 className="font-bold text-lg text-white truncate">{ad.companyName}</h3>
                      <p className="text-xs text-yellow-500 font-semibold mt-1">📍 Slot: {ad.adSlot}</p>
                    </div>

                    {/* Media Preview */}
                    {ad.mediaUrl && (
                      <div className="relative bg-black/50 rounded-lg overflow-hidden h-40">
                        {ad.adType === 'image' ? (
                          <img
                            src={ad.mediaUrl}
                            alt={ad.companyName}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <div className="text-center">
                              <p className="text-4xl mb-2">🎬</p>
                              <p className="text-gray-400 text-sm">Video Ad</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Type</p>
                        <Badge className={`${ad.adType === 'image' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                          {ad.adType === 'image' ? '📷 Image' : '🎬 Video'}
                        </Badge>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Revenue</p>
                        <p className="text-yellow-500 font-bold">₹{(ad.revenue || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Views</p>
                        <p className="text-white font-semibold">{ad.viewCount || 0}</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Clicks</p>
                        <p className="text-white font-semibold">{ad.clickCount || 0}</p>
                      </div>
                    </div>

                    {/* CTR */}
                    <div className="bg-yellow-500/10 border border-yellow-600/30 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">CTR (Click Through Rate)</p>
                      <p className="text-yellow-500 font-bold">
                        {ad.viewCount > 0
                          ? ((ad.clickCount / ad.viewCount) * 100).toFixed(2)
                          : 0}
                        %
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {/* Toggle Active/Inactive Button */}
                      <Button
                        onClick={() => handleToggleActive(ad)}
                        disabled={toggling === ad.id}
                        className={`flex-1 gap-2 font-semibold transition-all duration-200 ${
                          ad.isActive
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                            : 'bg-green-600/20 hover:bg-green-600/30 text-green-500 border border-green-600/50'
                        }`}
                      >
                        {toggling === ad.id ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Toggling...
                          </>
                        ) : ad.isActive ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Activate
                          </>
                        )}
                      </Button>

                      {/* Delete Button */}
                      <Button
                        onClick={() => handleDelete(ad.id)}
                        disabled={deleting === ad.id}
                        className="bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-600/50 gap-2 font-semibold"
                      >
                        {deleting === ad.id ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Footer */}
        {filteredAds.length > 0 && (
          <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-600/30">
            <CardContent className="py-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-yellow-500 font-semibold">Showing {filteredAds.length} ads</p>
                  <p className="text-gray-400 text-sm">
                    {activeCount} active • {inactiveCount} inactive
                  </p>
                </div>
                <div>
                  <p className="text-right font-semibold text-white">
                    Total Revenue: <span className="text-yellow-500">₹{filteredAds.reduce((sum, ad) => sum + (ad.revenue || 0), 0).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}