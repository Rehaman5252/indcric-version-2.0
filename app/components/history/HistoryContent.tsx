'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface QuizAttempt {
  id: string;
  format: string;
  score: number;
  totalQuestions: number;
  timestamp: number;
  brand: string;
}

export default function QuizHistoryContent({ userId }: { userId: string }) {
  const router = useRouter();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        // Fetch quiz history from Firebase or API
        // For now using placeholder data
        const mockAttempts: QuizAttempt[] = [
          {
            id: '1',
            format: 'T20',
            score: 4,
            totalQuestions: 5,
            timestamp: Date.now() - 86400000,
            brand: 'Samsung',
          },
          {
            id: '2',
            format: 'ODI',
            score: 3,
            totalQuestions: 5,
            timestamp: Date.now() - 172800000,
            brand: 'OnePlus',
          },
        ];
        setAttempts(mockAttempts);
      } catch (error) {
        console.error('Error loading quiz history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [userId]);

  if (loading) {
    return <div className="text-center py-8">⏳ Loading history...</div>;
  }

  if (attempts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500 mb-4">📭 No quiz attempts yet</p>
          <Button onClick={() => router.push('/')}>Take Your First Quiz</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Quiz History</h2>
      {attempts.map((attempt) => (
        <Card key={attempt.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              {attempt.format} Cricket Quiz - {attempt.brand}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Score: <span className="font-bold text-green-600">{attempt.score}/{attempt.totalQuestions}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(attempt.timestamp).toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
