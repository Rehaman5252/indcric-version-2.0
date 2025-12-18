import { AdSlot } from '@/lib/ad-service';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ✅ UNIFIED AD INTERFACE - MATCHES lib/ad-service.ts
export interface Ad {
  id: string;
  companyName: string;
  adSlot: AdSlot;
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

// Interface for interstitial ads (between questions)
export interface InterstitialAdConfig {
  type: 'static' | 'video';
  logoUrl?: string;
  logoHint?: string;
  durationMs?: number;
  videoUrl?: string;
  videoTitle?: string;
  durationSec?: number;
  skippableAfterSec?: number;
}

// ✅ NEW: Hint ad config (for Q1_HINT…Q5_HINT)
export interface HintAdConfig {
  duration: number;
  skippableAfter: number;
  title: string;
  type: 'image' | 'video';
  url: string;
  adId?: string;
  adSlot?: string;
}

// ✅ FETCH AD FROM FIRESTORE BY SLOT - RETURNS FULL Ad OBJECT
export async function getAdForSlot(
  slot: AdSlot | string | null | undefined
): Promise<Ad | null> {
  try {
    if (!slot) {
      console.warn('⚠️ [getAdForSlot] No slot provided');
      return null;
    }

    console.log(`🔍 [getAdForSlot] Fetching from Firebase for slot: ${slot}`);

    const q = query(
      collection(db, 'ads'),
      where('adSlot', '==', slot),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn(`⚠️ [getAdForSlot] No ads found in Firebase for slot: ${slot}`);
      return null;
    }

    const docSnap = snapshot.docs[0];
    const docData = docSnap.data();

    const ad: Ad = {
      id: docSnap.id,
      companyName: docData.companyName || '',
      adSlot: docData.adSlot,
      adType: docData.adType || 'image',
      mediaUrl: docData.mediaUrl || '',
      redirectUrl: docData.redirectUrl || '',
      revenue: docData.revenue || 0,
      viewCount: docData.viewCount || 0,
      clickCount: docData.clickCount || 0,
      isActive: docData.isActive ?? true,
      createdAt: docData.createdAt,
      updatedAt: docData.updatedAt,
    };

    console.log(`✅ [getAdForSlot] Ad found from Firebase:`, ad.companyName, ad.mediaUrl);
    return ad;
  } catch (error) {
    console.error('❌ [getAdForSlot] Error fetching from Firebase:', error);
    return null;
  }
}

export async function getInterstitialAdForSlot(
  slot: AdSlot | null | undefined
): Promise<InterstitialAdConfig | null> {
  try {
    if (!slot) {
      console.warn('⚠️ [getInterstitialAdForSlot] No slot provided');
      return null;
    }

    console.log(`🔍 [getInterstitialAdForSlot] Fetching interstitial ad for slot: ${slot}`);

    const ad = await getAdForSlot(slot);

    if (!ad) {
      console.warn(`⚠️ [getInterstitialAdForSlot] No ad found for slot: ${slot}`);
      return null;
    }

    const isVideo =
      ad.adType === 'video' || ad.mediaUrl.toLowerCase().includes('.mp4');

    console.log(
      `🎬 [getInterstitialAdForSlot] Ad type detected: ${isVideo ? 'VIDEO' : 'IMAGE'}`
    );

    const durationSec = isVideo ? 40 : 10;
    const durationMs = durationSec * 1000;

    let skippableAfterSec: number;
    const slotStr = String(slot);
    if (slotStr === 'Q3' || slotStr === 'Q4') {
      skippableAfterSec = 20;
    } else {
      skippableAfterSec = Math.max(5, durationSec - 5);
    }

    const interstitialConfig: InterstitialAdConfig = {
      type: isVideo ? 'video' : 'static',
      logoUrl: !isVideo ? ad.mediaUrl : undefined,
      logoHint: ad.companyName,
      durationMs,
      durationSec,
      videoUrl: isVideo ? ad.mediaUrl : undefined,
      videoTitle: ad.companyName,
      skippableAfterSec,
    };

    console.log(`✅ [getInterstitialAdForSlot] Interstitial ad config:`, {
      type: interstitialConfig.type,
      duration: `${durationSec}s (${durationMs}ms)`,
      hasVideo: !!interstitialConfig.videoUrl,
      hasLogo: !!interstitialConfig.logoUrl,
      skippableAfterSec,
    });

    return interstitialConfig;
  } catch (error) {
    console.error('❌ [getInterstitialAdForSlot] Error:', error);
    return null;
  }
}

// ✅ NEW: fetch hint ad for a specific question (Q1_HINT…Q5_HINT)
export async function getHintAd(
  questionNumber: number
): Promise<HintAdConfig | null> {
  try {
    const hintSlots = ['Q1_HINT', 'Q2_HINT', 'Q3_HINT', 'Q4_HINT', 'Q5_HINT'];
    const adSlot = hintSlots[questionNumber - 1];

    if (!adSlot) {
      console.log(`⚠️ [HintAd] No hint ad slot for Q${questionNumber}`);
      return null;
    }

    console.log(`🔍 [HintAd] Fetching Firebase hint ad for: ${adSlot}`);

    const ad = await getAdForSlot(adSlot);

    if (!ad) {
      console.log(`⚠️ [HintAd] No active hint ad found for ${adSlot}`);
      return null;
    }

    const hintAdConfig: HintAdConfig = {
      duration: 7,
      skippableAfter: 5,
      title: ad.companyName || 'Hint',
      type: ad.adType === 'video' ? 'video' : 'image',
      url: ad.mediaUrl || '',
      adId: ad.id,
      adSlot,
    };

    console.log(`✅ [HintAd] Fetched for ${adSlot}:`, {
      company: ad.companyName,
      type: ad.adType,
      url: ad.mediaUrl ? '✓' : '✗',
    });

    return hintAdConfig;
  } catch (error) {
    console.error('❌ [HintAd] Error fetching hint ad:', error);
    return null;
  }
}

// ✅ NEW: log a view for a hint ad
export async function logHintAdView(adSlot: string): Promise<void> {
  try {
    const adsRef = collection(db, 'ads');
    const q = query(adsRef, where('adSlot', '==', adSlot), where('isActive', '==', true));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const adDoc = snapshot.docs[0];
      await updateDoc(adDoc.ref, {
        viewCount: increment(1),
        updatedAt: serverTimestamp(),
      });
      console.log(`📊 [HintAd] View logged for ${adSlot}`);
    }
  } catch (error) {
    console.error('❌ Error logging hint ad view:', error);
  }
}
