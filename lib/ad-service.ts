// lib/ad-service.ts - COMPLETE FIXED VERSION
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  increment,
  onSnapshot,
} from 'firebase/firestore';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


// ✅ TYPE DEFINITIONS - UPDATED WITH HINT SLOTS (16 TOTAL)
export type AdSlot =
  // 🎲 Cube Faces (6)
  | 'T20'
  | 'IPL'
  | 'ODI'
  | 'WPL'
  | 'Test'
  | 'Mixed'
  // ❓ Quiz Flow (5)
  | 'Q1_Q2'
  | 'Q2_Q3'
  | 'Q3_Q4'
  | 'Q4_Q5'
  | 'AfterQuiz'
  // 💡 Hint Ads (5)
  | 'Q1_HINT'
  | 'Q2_HINT'
  | 'Q3_HINT'
  | 'Q4_HINT'
  | 'Q5_HINT';


// ✅ AD SLOT NAMES CONSTANT
export const AD_SLOT_NAMES: Record<AdSlot, string> = {
  // 🎲 Cube Faces
  T20: 'T20 Cricket',
  IPL: 'IPL League',
  ODI: 'ODI League',
  WPL: "Women's Premier League",
  Test: 'Test Cricket',
  Mixed: 'Mixed Format',
  // ❓ Quiz Flow
  Q1_Q2: 'Between Q1→Q2',
  Q2_Q3: 'Between Q2→Q3',
  Q3_Q4: 'Between Q3→Q4 (Video)',
  Q4_Q5: 'Between Q4→Q5',
  AfterQuiz: 'After Quiz (Video)',
  // 💡 Hint Ads
  Q1_HINT: '💡 Question 1 Hint Ad',
  Q2_HINT: '💡 Question 2 Hint Ad',
  Q3_HINT: '💡 Question 3 Hint Ad',
  Q4_HINT: '💡 Question 4 Hint Ad',
  Q5_HINT: '💡 Question 5 Hint Ad',
};


// ✅ THIS IS THE UNIFIED Ad INTERFACE - USED EVERYWHERE
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


export interface AdViewLog {
  id: string;
  adId: string;
  userId: string;
  viewedAt: any;
  adSlot: AdSlot;
  companyName: string;
}


export interface AdClickLog {
  id: string;
  adId: string;
  userId: string;
  clickedAt: any;
  adSlot: AdSlot;
  companyName: string;
}


// ✅ REVENUE RECORD TYPE - FIXED (only 'created' | 'updated', no 'deleted')
export interface RevenueRecord {
  id: string;
  adId: string;
  adName: string;
  amount: number;
  timestamp: any;
  type: 'created' | 'updated';
}


// ✅ DELETED AD TYPE
export interface DeletedAd extends Ad {
  deletedAt: any;
  reasonForDeletion?: string;
}


// ✅ CACHE SYSTEM
const adCache = new Map<AdSlot, { ads: Ad[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes


function isCacheValid(adSlot: AdSlot): boolean {
  const cached = adCache.get(adSlot);
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_DURATION;
}


function getCachedAds(adSlot: AdSlot): Ad[] | null {
  if (isCacheValid(adSlot)) {
    const cached = adCache.get(adSlot);
    console.log(`💾 [Cache HIT] Returning cached ads for ${adSlot}`);
    return cached?.ads || null;
  }
  return null;
}


function setCachedAds(adSlot: AdSlot, ads: Ad[]): void {
  adCache.set(adSlot, { ads, timestamp: Date.now() });
  console.log(`💾 [Cache SET] Cached ${ads.length} ads for ${adSlot}`);
}


// ✅ UPLOAD AD FILE TO FIREBASE STORAGE
export async function uploadAdFile(
  file: File,
  adSlot: AdSlot,
  companyName: string
): Promise<string> {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `ads/${adSlot}/${companyName}_${Date.now()}.${fileExtension}`;

    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    console.log('✅ Ad file uploaded:', downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error('❌ Error uploading ad file:', error);
    throw error;
  }
}


// ✅ CREATE NEW AD WITH AUTOMATIC REVENUE RECORDING
export async function uploadAd(adData: {
  companyName: string;
  adSlot: string;
  adType: 'image' | 'video';
  mediaUrl: string;
  redirectUrl: string;
  revenue: number;
  isActive: boolean;
  viewCount: number;
  clickCount: number;
}): Promise<string> {
  try {
    // Create ad in ads collection
    const docRef = await addDoc(collection(db, 'ads'), {
      companyName: adData.companyName,
      adSlot: adData.adSlot,
      adType: adData.adType,
      mediaUrl: adData.mediaUrl,
      redirectUrl: adData.redirectUrl,
      revenue: adData.revenue,
      viewCount: adData.viewCount,
      clickCount: adData.clickCount,
      isActive: adData.isActive,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Record revenue in history (type: 'created')
    await addDoc(collection(db, 'revenueHistory'), {
      adId: docRef.id,
      adName: adData.companyName,
      amount: adData.revenue,
      type: 'created',
      timestamp: serverTimestamp(),
    });

    // Clear cache
    adCache.delete(adData.adSlot as AdSlot);
    console.log('✅ Ad uploaded with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error uploading ad:', error);
    throw error;
  }
}


// ✅ CREATE NEW AD (OLD METHOD - BACKWARD COMPATIBLE)
export async function createAd(
  companyName: string,
  adSlot: AdSlot,
  adType: 'image' | 'video',
  mediaUrl: string,
  redirectUrl: string,
  revenue: number
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'ads'), {
      companyName,
      adSlot,
      adType,
      mediaUrl,
      redirectUrl,
      revenue,
      viewCount: 0,
      clickCount: 0,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Record revenue in history
    await addDoc(collection(db, 'revenueHistory'), {
      adId: docRef.id,
      adName: companyName,
      amount: revenue,
      type: 'created',
      timestamp: serverTimestamp(),
    });

    adCache.delete(adSlot);
    console.log('✅ Ad created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating ad:', error);
    throw error;
  }
}


// ✅ GET ALL ACTIVE ADS
export async function getAllActiveAds(): Promise<Ad[]> {
  try {
    const q = query(collection(db, 'ads'), where('isActive', '==', true));

    const snapshot = await getDocs(q);
    const ads = snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Ad)
    );

    console.log('✅ Fetched active ads:', ads.length);
    return ads;
  } catch (error) {
    console.error('❌ Error fetching ads:', error);
    return [];
  }
}


// ✅ GET ALL ADS BY SLOT (WITH CACHING & TYPE FIX)
export async function getAdsBySlot(
  adSlot: AdSlot | '' | undefined | null
): Promise<Ad[]> {
  try {
    if (typeof adSlot !== 'string' || adSlot.length === 0) {
      console.warn('⚠️ [getAdsBySlot] Called with invalid adSlot:', adSlot);
      return [];
    }

    const cachedAds = getCachedAds(adSlot as AdSlot);
    if (cachedAds !== null) {
      return cachedAds;
    }

    console.log(`[getAdsBySlot] 🔍 Querying Firebase for slot: "${adSlot}"`);

    const q = query(
      collection(db, 'ads'),
      where('adSlot', '==', adSlot),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn(`⚠️ [getAdsBySlot] No ads found for slot: ${adSlot}`);
      setCachedAds(adSlot as AdSlot, []);
      return [];
    }

    const ads = snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Ad)
    );

    console.log(
      `✅ [getAdsBySlot] Found ${ads.length} ad(s) for slot: ${adSlot}`
    );
    setCachedAds(adSlot as AdSlot, ads);
    return ads;
  } catch (error) {
    console.error('[getAdsBySlot] Firebase Error:', error);
    return [];
  }
}


// ✅ GET AD BY SLOT (SINGLE)
export async function getAdBySlot(
  adSlot: AdSlot | '' | undefined | null
): Promise<Ad | null> {
  try {
    if (typeof adSlot !== 'string' || adSlot.length === 0) {
      console.warn('⚠️ [getAdBySlot] Called with invalid adSlot:', adSlot);
      return null;
    }

    const ads = await getAdsBySlot(adSlot as AdSlot);
    if (ads.length > 0) {
      console.log(`✅ [getAdBySlot] Returning ad for ${adSlot}`);
      return ads[0];
    }

    console.warn(`⚠️ [getAdBySlot] No ads for ${adSlot}`);
    return null;
  } catch (error) {
    console.error('❌ [getAdBySlot] Error:', error);
    return null;
  }
}


// ✅ INCREMENT VIEW COUNT
export async function incrementAdView(adId: string): Promise<void> {
  try {
    if (!adId) {
      console.warn('⚠️ [incrementAdView] No adId provided');
      return;
    }

    const adRef = doc(db, 'ads', adId);
    await updateDoc(adRef, {
      viewCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ View count incremented for ad:', adId);
  } catch (error) {
    console.error('❌ Error incrementing view count:', error);
  }
}


// ✅ INCREMENT CLICK COUNT
export async function incrementAdClick(adId: string): Promise<void> {
  try {
    if (!adId) {
      console.warn('⚠️ [incrementAdClick] No adId provided');
      return;
    }

    const adRef = doc(db, 'ads', adId);
    await updateDoc(adRef, {
      clickCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Click count incremented for ad:', adId);
  } catch (error) {
    console.error('❌ Error incrementing click count:', error);
  }
}


// ✅ LOG AD VIEW
export async function logAdView(
  adId: string,
  userId: string,
  adSlot: AdSlot,
  companyName: string
): Promise<void> {
  try {
    if (!adId || !userId) {
      console.warn('⚠️ [logAdView] Missing adId or userId');
      return;
    }

    await incrementAdView(adId);

    await addDoc(collection(db, 'adViewLogs'), {
      adId,
      userId,
      viewedAt: serverTimestamp(),
      adSlot,
      companyName,
    });

    console.log('✅ Ad view logged:', { adId, adSlot, companyName });
  } catch (error) {
    console.error('❌ Error logging ad view:', error);
  }
}


// ✅ LOG AD CLICK
export async function logAdClick(
  adId: string,
  userId: string,
  adSlot: AdSlot,
  companyName: string
): Promise<void> {
  try {
    if (!adId || !userId) {
      console.warn('⚠️ [logAdClick] Missing adId or userId');
      return;
    }

    await incrementAdClick(adId);

    await addDoc(collection(db, 'adClickLogs'), {
      adId,
      userId,
      clickedAt: serverTimestamp(),
      adSlot,
      companyName,
    });

    console.log('✅ Ad click logged:', { adId, adSlot, companyName });
  } catch (error) {
    console.error('❌ Error logging ad click:', error);
  }
}


// ✅ UPDATE AD WITH REVENUE TRACKING
export async function updateAd(
  adId: string,
  updates: Partial<Ad>
): Promise<void> {
  try {
    if (!adId) {
      console.warn('⚠️ [updateAd] No adId provided');
      return;
    }

    // If revenue is being updated, record the difference
    if (updates.revenue !== undefined) {
      const adRef = doc(db, 'ads', adId);
      const currentDoc = await getDocs(query(collection(db, 'ads'), where('__name__', '==', adId)));
      
      if (!currentDoc.empty) {
        const currentRevenue = currentDoc.docs[0].data().revenue || 0;
        const revenueDifference = updates.revenue - currentRevenue;

        if (revenueDifference !== 0) {
          // Record the revenue change
          await addDoc(collection(db, 'revenueHistory'), {
            adId,
            adName: updates.companyName || currentDoc.docs[0].data().companyName,
            amount: revenueDifference,
            type: 'updated',
            timestamp: serverTimestamp(),
          });
        }
      }
    }

    const adRef = doc(db, 'ads', adId);
    await updateDoc(adRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    if (updates.adSlot) {
      adCache.delete(updates.adSlot as AdSlot);
    }

    console.log('✅ Ad updated:', adId);
  } catch (error) {
    console.error('❌ Error updating ad:', error);
  }
}


// ✅ DELETE AD - ARCHIVE TO deletedAds COLLECTION
export async function deleteAd(adId: string): Promise<void> {
  try {
    if (!adId) {
      console.warn('⚠️ [deleteAd] No adId provided');
      return;
    }

    // Fetch the ad document
    const adRef = doc(db, 'ads', adId);
    const adSnapshot = await getDocs(query(collection(db, 'ads'), where('__name__', '==', adId)));

    if (!adSnapshot.empty) {
      const adData = adSnapshot.docs[0].data();

      // Copy to deletedAds collection
      await addDoc(collection(db, 'deletedAds'), {
        ...adData,
        id: adId,
        deletedAt: serverTimestamp(),
        reasonForDeletion: 'Admin deleted',
      });

      console.log('✅ Ad archived to deletedAds:', adId);
    }

    // Delete from ads collection
    await deleteDoc(adRef);
    console.log('✅ Ad deleted from active collection:', adId);
  } catch (error) {
    console.error('❌ Error deleting ad:', error);
  }
}


// ✅ GET DELETED ADS
export async function getDeletedAds(): Promise<DeletedAd[]> {
  try {
    const snapshot = await getDocs(collection(db, 'deletedAds'));
    const deletedAds = snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as DeletedAd)
    );

    console.log('✅ Fetched deleted ads:', deletedAds.length);
    return deletedAds;
  } catch (error) {
    console.error('❌ Error fetching deleted ads:', error);
    return [];
  }
}


// ✅ GET REVENUE HISTORY (IMMUTABLE - only 'created' and 'updated' types)
export async function getRevenueHistory(): Promise<RevenueRecord[]> {
  try {
    const snapshot = await getDocs(collection(db, 'revenueHistory'));
    const records = snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as RevenueRecord)
    );

    console.log('✅ Fetched revenue history:', records.length);
    return records;
  } catch (error) {
    console.error('❌ Error fetching revenue history:', error);
    return [];
  }
}


// ✅ GET TOTAL REVENUE (FROM HISTORY - NEVER DECREASES)
export async function getTotalRevenue(): Promise<number> {
  try {
    const records = await getRevenueHistory();
    const total = records.reduce((sum, record) => sum + (record.amount || 0), 0);

    console.log('✅ Total revenue:', total);
    return total;
  } catch (error) {
    console.error('❌ Error calculating total revenue:', error);
    return 0;
  }
}


// ✅ SUBSCRIBE TO ADS CHANGES
export function subscribeToAds(callback: (ads: Ad[]) => void): () => void {
  const q = query(collection(db, 'ads'), where('isActive', '==', true));

  const unsubscribe = onSnapshot(q, snapshot => {
    const ads = snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Ad)
    );

    adCache.clear();

    callback(ads);
  });

  return unsubscribe;
}


// ✅ GET AD ANALYTICS
export async function getAdAnalytics(): Promise<{
  totalAds: number;
  activeAds: number;
  deletedAds: number;
  totalViews: number;
  totalClicks: number;
  totalRevenue: number;
}> {
  try {
    const allAdsSnapshot = await getDocs(collection(db, 'ads'));
    const allAds = allAdsSnapshot.docs.map(doc => doc.data() as Ad);

    const activeAds = allAds.filter(ad => ad.isActive);

    const deletedAdsSnapshot = await getDocs(collection(db, 'deletedAds'));
    const deletedAdsCount = deletedAdsSnapshot.size;

    const viewLogsSnapshot = await getDocs(collection(db, 'adViewLogs'));
    const totalViews = viewLogsSnapshot.size;

    const clickLogsSnapshot = await getDocs(collection(db, 'adClickLogs'));
    const totalClicks = clickLogsSnapshot.size;

    const totalRevenue = await getTotalRevenue();

    console.log('📊 Ad Analytics:', {
      totalAds: allAds.length,
      activeAds: activeAds.length,
      deletedAds: deletedAdsCount,
      totalViews,
      totalClicks,
      totalRevenue,
    });

    return {
      totalAds: allAds.length,
      activeAds: activeAds.length,
      deletedAds: deletedAdsCount,
      totalViews,
      totalClicks,
      totalRevenue,
    };
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    return {
      totalAds: 0,
      activeAds: 0,
      deletedAds: 0,
      totalViews: 0,
      totalClicks: 0,
      totalRevenue: 0,
    };
  }
}


// ✅ GET ALL ADS (FOR ADMIN)
export async function getAllAds(): Promise<Ad[]> {
  try {
    const snapshot = await getDocs(collection(db, 'ads'));
    const ads = snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Ad)
    );

    console.log('✅ Fetched all ads (admin):', ads.length);
    return ads;
  } catch (error) {
    console.error('❌ Error fetching all ads:', error);
    return [];
  }
}


// ✅ GET VIEW LOGS
export async function getAdViewLogs(adId: string): Promise<AdViewLog[]> {
  try {
    if (!adId) {
      console.warn('⚠️ [getAdViewLogs] No adId provided');
      return [];
    }

    const q = query(
      collection(db, 'adViewLogs'),
      where('adId', '==', adId)
    );

    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as AdViewLog)
    );

    return logs;
  } catch (error) {
    console.error('❌ Error fetching view logs:', error);
    return [];
  }
}


// ✅ GET CLICK LOGS
export async function getAdClickLogs(adId: string): Promise<AdClickLog[]> {
  try {
    if (!adId) {
      console.warn('⚠️ [getAdClickLogs] No adId provided');
      return [];
    }

    const q = query(
      collection(db, 'adClickLogs'),
      where('adId', '==', adId)
    );

    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as AdClickLog)
    );

    return logs;
  } catch (error) {
    console.error('❌ Error fetching click logs:', error);
    return [];
  }
}


// ✅ CLEAR AD CACHE
export function clearAdCache(): void {
  adCache.clear();
  console.log('💾 [Cache] Cleared all cached ads');
}