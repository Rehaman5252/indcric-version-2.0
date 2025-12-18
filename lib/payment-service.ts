import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { PaymentRequest, PaymentStats } from '@/types/payment';

/**
 * Create a payment request when user scores 5/5
 */
export const createPaymentRequest = async (
  userId: string,
  quizId: string,
  score: number,
  totalQuestions: number
): Promise<string | null> => {
  try {
    // Only create payment for perfect score
    if (score !== totalQuestions) {
      return null;
    }

    // ✅ Idempotency: check if a payment already exists for this user + quiz
    const existingSnap = await getDocs(
      query(
        collection(db, 'paymentRequests'),
        where('userId', '==', userId),
        where('quizId', '==', quizId)
      )
    );

    if (!existingSnap.empty) {
      const existingDoc = existingSnap.docs[0];
      console.log('⚠️ Payment already exists for this user+quiz:', existingDoc.id);
      return existingDoc.id;
    }

    // Fetch user details
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();

    // Create payment request
    const paymentData = {
      userId,
      userName: userData.name || 'Unknown User',
      userEmail: userData.email || '',
      userPhone: userData.phone || '',
      userUpi: userData.upi || '',
      amount: 100, // ₹100 reward
      quizId,
      score,
      totalQuestions,
      status: 'pending' as const,
      createdAt: Timestamp.now(),
    };

    // Option A: deterministic ID (optional but safer)
    const deterministicId = `${userId}_${quizId}`;
    await setDoc(doc(db, 'paymentRequests', deterministicId), paymentData);
    console.log('✅ Payment request created (idempotent):', deterministicId);
    return deterministicId;

    // If you prefer random IDs, comment above 3 lines and uncomment below:
    // const docRef = await addDoc(collection(db, 'paymentRequests'), paymentData);
    // console.log('✅ Payment request created:', docRef.id);
    // return docRef.id;
  } catch (error) {
    console.error('❌ Error creating payment request:', error);
    throw error;
  }
};

/**
 * Get all payment requests with optional status filter
 * ✅ De‑duplicate: for same userId + quizId, keep only the FIRST created
*/
export const getAllPaymentRequests = async (
  status?: 'pending' | 'completed' | 'failed'
): Promise<PaymentRequest[]> => {
  try {
    let q;

    if (status) {
      q = query(
        collection(db, 'paymentRequests'),
        where('status', '==', status),
        orderBy('createdAt', 'asc') // earliest first
      );
    } else {
      q = query(
        collection(db, 'paymentRequests'),
        orderBy('createdAt', 'asc') // earliest first
      );
    }

    const snapshot = await getDocs(q);

    const allPayments = snapshot.docs.map(
      (docSnap) =>
        ({
          id: docSnap.id,
          ...docSnap.data(),
        } as PaymentRequest)
    );

    // Helper: compute 10‑minute slot start millis from createdAt
    const getSlotStartKey = (createdAt: any): number => {
      const ms = createdAt.toDate().getTime();
      const slotLength = 10 * 60 * 1000; // 10 minutes in ms
      return Math.floor(ms / slotLength) * slotLength; // start of that 10‑min bucket
    };

    // De‑dup by (userId, 10‑minute slot), keep FIRST (earliest) only
    const map = new Map<string, PaymentRequest>();

    for (const p of allPayments) {
      const slotStart = getSlotStartKey(p.createdAt);
      const key = `${p.userId}_${slotStart}`;
      if (!map.has(key)) {
        map.set(key, p); // first one in that 10‑minute window, e.g. 9:52 not 9:53
      }
    }

    // Sort for UI: newest first
    const deduped = Array.from(map.values()).sort(
      (a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
    );

    return deduped;
  } catch (error) {
    console.error('Error fetching payment requests:', error);
    throw error;
  }
};



/**
 * Mark payment as completed
 */
export const markPaymentCompleted = async (
  paymentId: string,
  adminEmail: string,
  notes?: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'paymentRequests', paymentId), {
      status: 'completed',
      completedAt: Timestamp.now(),
      completedBy: adminEmail,
      notes: notes || '',
    });
    console.log('✅ Payment marked as completed:', paymentId);
  } catch (error) {
    console.error('Error completing payment:', error);
    throw error;
  }
};

/**
 * Mark payment as failed
 */
export const markPaymentFailed = async (
  paymentId: string,
  adminEmail: string,
  failureReason: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'paymentRequests', paymentId), {
      status: 'failed',
      completedAt: Timestamp.now(),
      completedBy: adminEmail,
      failureReason,
    });
    console.log('❌ Payment marked as failed:', paymentId);
  } catch (error) {
    console.error('Error marking payment as failed:', error);
    throw error;
  }
};

/**
 * Get payment statistics
 */
export const getPaymentStats = async (): Promise<PaymentStats> => {
  try {
    // Uses deduped list
    const allPayments = await getAllPaymentRequests();

    const stats: PaymentStats = {
      totalPayments: allPayments.length,
      pendingPayments: allPayments.filter((p) => p.status === 'pending').length,
      completedPayments: allPayments.filter((p) => p.status === 'completed').length,
      failedPayments: allPayments.filter((p) => p.status === 'failed').length,
      totalAmount: allPayments.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: allPayments
        .filter((p) => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0),
      completedAmount: allPayments
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
    };

    return stats;
  } catch (error) {
    console.error('Error calculating stats:', error);
    throw error;
  }
};
