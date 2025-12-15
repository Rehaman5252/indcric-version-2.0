'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KPICard from './KPICard';
import QuickActions from './QuickActions';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalUsers: number;
  activeQuizzes: number;
  perfectWinners: number;
  pendingPayouts: number;
  activeAds: number;
  pendingComments: number;
  cubeLogos: number;
  activeAdmins: number;
  failedLogins: number;
  lastBackup: string;
}

export default function DashboardHome() {
  const router = useRouter();
  const [stats] = useState<DashboardStats>({
    totalUsers: 1240,
    activeQuizzes: 3,
    perfectWinners: 45,
    pendingPayouts: 25000,
    activeAds: 12,
    pendingComments: 8,
    cubeLogos: 6,
    activeAdmins: 2,
    failedLogins: 3,
    lastBackup: '2 hours ago',
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-0 shadow-lg">
        <CardContent className="pt-6">
          <h1 className="text-3xl font-bold">Welcome to IndCric Super Admin Panel 🎉</h1>
          <p className="text-green-100 mt-2">Real-time monitoring, full system control, and complete audit trail.</p>
        </CardContent>
      </Card>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          metric={{
            id: 'users',
            label: "Total Users",
            value: stats.totalUsers,
            unit: "",
            description: "Registered users",
            icon: "👥",
            color: "from-blue-500 to-blue-600",
            trend: 'up',
            growth: 12
          }}
        />
        <KPICard
          metric={{
            id: 'quizzes',
            label: "Active Quizzes",
            value: stats.activeQuizzes,
            unit: "",
            description: "Live quizzes",
            icon: "❓",
            color: "from-green-500 to-green-600",
            trend: 'up',
            growth: 5
          }}
        />
        <KPICard
          metric={{
            id: 'winners',
            label: "Perfect Winners",
            value: stats.perfectWinners,
            unit: "",
            description: "5/5 correct",
            icon: "🏆",
            color: "from-yellow-500 to-yellow-600",
            trend: 'up',
            growth: 8
          }}
        />
        <KPICard
          metric={{
            id: 'payouts',
            label: "Pending Payouts",
            value: `₹${stats.pendingPayouts}`,
            unit: "",
            description: "Awaiting processing",
            icon: "💸",
            color: "from-red-500 to-red-600",
            trend: 'stable',
            growth: 0
          }}
        />
        <KPICard
          metric={{
            id: 'ads',
            label: "Active Ads",
            value: stats.activeAds,
            unit: "",
            description: "Running campaigns",
            icon: "📢",
            color: "from-purple-500 to-purple-600",
            trend: 'up',
            growth: 3
          }}
        />
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          metric={{
            id: 'comments',
            label: "Pending Comments",
            value: stats.pendingComments,
            unit: "",
            description: "Awaiting moderation",
            icon: "💬",
            color: "from-orange-500 to-orange-600",
            trend: 'stable',
            growth: 0
          }}
        />
        <KPICard
          metric={{
            id: 'logos',
            label: "Cube Logos",
            value: stats.cubeLogos,
            unit: "",
            description: "Brand logos",
            icon: "🏢",
            color: "from-indigo-500 to-indigo-600",
            trend: 'stable',
            growth: 0
          }}
        />
        <KPICard
          metric={{
            id: 'admins',
            label: "Active Admins",
            value: stats.activeAdmins,
            unit: "",
            description: "Online now",
            icon: "🔑",
            color: "from-cyan-500 to-cyan-600",
            trend: 'stable',
            growth: 0
          }}
        />
        <KPICard
          metric={{
            id: 'failed',
            label: "Failed Logins",
            value: stats.failedLogins,
            unit: "",
            description: "Last 24 hours",
            icon: "⚠️",
            color: "from-pink-500 to-pink-600",
            trend: 'down',
            growth: -2
          }}
        />
        <KPICard
          metric={{
            id: 'backup',
            label: "Last Backup",
            value: stats.lastBackup,
            unit: "",
            description: "Latest backup",
            icon: "💾",
            color: "from-gray-500 to-gray-600",
            trend: 'stable',
            growth: 0
          }}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity Preview */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>📊 Recent Admin Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2 pb-2 border-b">
              <span className="text-green-600">✓</span> <strong>Rehaman</strong> approved 3 posts • 5 min ago
            </p>
            <p className="flex items-center gap-2 pb-2 border-b">
              <span className="text-blue-600">ℹ️</span> <strong>Rahul</strong> processed payout ₹500 • 15 min ago
            </p>
            <p className="flex items-center gap-2 pb-2 border-b">
              <span className="text-purple-600">📢</span> <strong>Admin</strong> uploaded new ad campaign • 30 min ago
            </p>
            <p className="flex items-center gap-2">
              <span className="text-yellow-600">📝</span> <strong>Moderator</strong> created quiz slot #12 • 1 hour ago
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/activity-monitor')}
            className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition font-semibold"
          >
            View Full Activity Log →
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
