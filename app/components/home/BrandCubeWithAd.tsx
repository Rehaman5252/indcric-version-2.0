'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Ad, getAdForSlot } from '@/lib/ads';
import { AdSlot } from '@/types/ads';

interface CubeBrand {
  brand: string;
  format: string;
  logoUrl?: string;
}

interface BrandCubeWithAdProps {
  brand: CubeBrand;
  userId: string;
  onClick: () => void;
}

export default function BrandCubeWithAd({ brand, userId, onClick }: BrandCubeWithAdProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAd = async () => {
      try {
        setLoading(true);
        const fetchedAd = await getAdForSlot(brand.format as AdSlot);
        setAd(fetchedAd);
      } catch (error) {
        console.error('Error loading ad:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAd();
  }, [brand.format]);

  return (
    <div className="space-y-3">
      {/* Brand Cube */}
      <div
        className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center hover:shadow-lg transition-shadow cursor-pointer"
        onClick={onClick}
      >
        {brand.logoUrl ? (
          <Image
            src={brand.logoUrl}
            alt={brand.brand}
            width={120}
            height={120}
            className="object-contain"
          />
        ) : (
          <div className="text-white text-center">
            <p className="text-2xl font-bold">{brand.brand}</p>
            <p className="text-xs">{brand.format}</p>
          </div>
        )}
      </div>

      {/* Brand Info */}
      <div className="text-center">
        <h3 className="font-bold text-white">{brand.brand}</h3>
        <p className="text-sm text-gray-400">{brand.format} Cricket</p>
      </div>

      {/* Ad Banner (if available) */}
      {!loading && ad && (
        <div className="mt-2 rounded-lg overflow-hidden border border-gray-700">
          {ad.adType === 'image' ? (
            <img
              src={ad.mediaUrl}
              alt={ad.companyName}
              className="w-full h-16 object-cover"
            />
          ) : (
            <div className="w-full h-16 bg-gray-800 flex items-center justify-center text-white text-xs">
              🎬 {ad.companyName}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
