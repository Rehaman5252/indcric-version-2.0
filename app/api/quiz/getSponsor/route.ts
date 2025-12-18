import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const slotId = request.nextUrl.searchParams.get('slotId');
        const brand = request.nextUrl.searchParams.get('brand');

        if (!slotId) {
            return NextResponse.json(
                { error: 'slotId is required' },
                { status: 400 }
            );
        }

        console.log(`[API] Fetching sponsor for slotId: ${slotId}`);

        // Fetch from quizSlots collection
        const slotRef = doc(db, 'quizSlots', slotId);
        const slotSnap = await getDoc(slotRef);

        if (slotSnap.exists()) {
            const slotData = slotSnap.data();
            const sponsor = slotData?.sponsor || slotData?.sponsorName || slotData?.brand || brand || 'CricBlitz';
            
            console.log(`[API] ✅ Sponsor fetched: ${sponsor}`);
            
            return NextResponse.json({ 
                sponsor,
                success: true 
            });
        } else {
            console.log(`[API] ⚠️ Quiz slot not found, using fallback`);
            
            return NextResponse.json({ 
                sponsor: brand || 'CricBlitz',
                success: true 
            });
        }
    } catch (error) {
        console.error('[API] ❌ Error fetching sponsor:', error);
        
        // Return fallback sponsor on error
        return NextResponse.json({ 
            sponsor: 'CricBlitz',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
