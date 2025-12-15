import { db, storage } from '@/lib/firebase';
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
  getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { News, NewsStats } from '@/types/news';

// Upload news image to Firebase Storage
export async function uploadNewsImage(
  file: File,
  position: number
): Promise<string> {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `news_slot_${position}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `news/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log('News image uploaded:', downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading news image:', error);
    throw error;
  }
}

// Create new news
export async function createNews(
  title: string,
  description: string,
  imageUrl: string,
  redirectUrl: string,
  position: number,
  userId: string
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'news'), {
      title,
      description,
      imageUrl,
      redirectUrl,
      position,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
    });
    console.log('News created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
}

// Get all news (for admin)
export async function getAllNews(): Promise<News[]> {
  try {
    const snapshot = await getDocs(collection(db, 'news'));
    const news = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as News[];
    return news.sort((a, b) => a.position - b.position);
  } catch (error) {
    console.error('Error fetching all news:', error);
    return [];
  }
}

// Get active news only (for homepage)
export async function getActiveNews(): Promise<News[]> {
  try {
    const q = query(
      collection(db, 'news'),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    const news = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as News[];
    return news.sort((a, b) => a.position - b.position);
  } catch (error) {
    console.error('Error fetching active news:', error);
    return [];
  }
}

// Update news
export async function updateNews(
  newsId: string,
  updates: Partial<News>
): Promise<void> {
  try {
    const newsRef = doc(db, 'news', newsId);
    await updateDoc(newsRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log('News updated:', newsId);
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
}

// Delete news
export async function deleteNews(newsId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'news', newsId));
    console.log('News deleted:', newsId);
  } catch (error) {
    console.error('Error deleting news:', error);
    throw error;
  }
}

// Toggle active status
export async function toggleNewsActive(
  newsId: string,
  isActive: boolean
): Promise<void> {
  try {
    await updateNews(newsId, { isActive });
  } catch (error) {
    console.error('Error toggling news status:', error);
    throw error;
  }
}

// Get news stats
export async function getNewsStats(): Promise<NewsStats> {
  try {
    const snapshot = await getDocs(collection(db, 'news'));
    const newsList = snapshot.docs.map((doc) => doc.data()) as News[];

    return {
      totalNews: newsList.length,
      activeNews: newsList.filter((n) => n.isActive).length,
      inactiveNews: newsList.filter((n) => !n.isActive).length,
    };
  } catch (error) {
    console.error('Error fetching news stats:', error);
    return {
      totalNews: 0,
      activeNews: 0,
      inactiveNews: 0,
    };
  }
}

// Log news click
export async function logNewsClick(
  newsId: string,
  userId: string
): Promise<void> {
  try {
    await addDoc(collection(db, 'newsClickLogs'), {
      newsId,
      userId,
      clickedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging news click:', error);
  }
}
