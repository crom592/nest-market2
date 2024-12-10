'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/components/notifications/NotificationCenter';
import { formatDate } from '@/lib/utils/date';

interface UserStats {
  participationCount: number;
  totalPurchases: number;
  activeGroupPurchases: number;
  rating: number | null;
}

const getLevelBadge = (level: string) => {
  const badges: Record<string, { text: string; color: string }> = {
    BEGINNER_SPARROW: { text: '초보참새', color: 'bg-gray-500' },
    GOOD_SPARROW: { text: '우수한참새', color: 'bg-green-500' },
    BEST_SPARROW: { text: '최우수참새', color: 'bg-blue-500' },
    LEADER_SPARROW: { text: '우두머리참새', color: 'bg-purple-500' },
    VIP_SPARROW: { text: 'VIP참새', color: 'bg-yellow-500' },
    BEGINNER_MOTHER_BIRD: { text: '초보어미새', color: 'bg-gray-500' },
    GOOD_MOTHER_BIRD: { text: '우수한어미새', color: 'bg-green-500' },
    BEST_MOTHER_BIRD: { text: '최우수어미새', color: 'bg-blue-500' },
    LEADER_MOTHER_BIRD: { text: '우두머리어미새', color: 'bg-purple-500' },
    VIP_MOTHER_BIRD: { text: 'VIP어미새', color: 'bg-yellow-500' },
  };

  return badges[level] || { text: '등급없음', color: 'bg-gray-300' };
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const { notifications } = useNotifications();
  const [userStats, setUserStats] = useState<UserStats>({
    participationCount: 0,
    totalPurchases: 0,
    activeGroupPurchases: 0,
    rating: null,
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserStats();
    }
  }, [session]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/users/stats');
      const data = await response.json();
      setUserStats(data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  if (!session?.user) {
    return <div>Loading...</div>;
  }

  const userLevel = (session.user as any).level || 'BEGINNER_SPARROW';
  const badge = getLevelBadge(userLevel);

  return (
    <div className="container mx-auto py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <Image
              src={session.user.image || '/default-avatar.png'}
              alt="Profile"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{session.user.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`${badge.color} text-white`}>
                {badge.text}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">참여 중인 공구</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{userStats.activeGroupPurchases}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">총 구매 건수</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{userStats.totalPurchases}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">평균 평점</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{userStats.rating?.toFixed(1) || '-'}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="purchases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="purchases">공구 내역</TabsTrigger>
          <TabsTrigger value="reviews">구매후기</TabsTrigger>
          <TabsTrigger value="notifications">알림</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>진행 중인 공구</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add GroupPurchaseList component here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>내 후기</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add ReviewList component here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>알림</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.isRead ? 'bg-gray-50' : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <span className="text-sm text-gray-500">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-600">{notification.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>프로필 설정</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add ProfileSettings component here */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
