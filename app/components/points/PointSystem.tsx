'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Share2, Trophy } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PointActivity {
  id: string;
  type: 'PARTICIPATION' | 'SHARE' | 'REVIEW' | 'ROULETTE';
  points: number;
  description: string;
  createdAt: Date;
}

interface PointSystemProps {
  activities?: PointActivity[];
}

const POINT_RULES = {
  PARTICIPATION: 100,  // 공구 참여
  SHARE: 50,          // 공구 공유
  REVIEW: 30,         // 리뷰 작성
  ROULETTE: 200,      // 룰렛 당첨
};

export default function PointSystem({ activities = [] }: PointSystemProps) {
  const { data: session } = useSession();
  const [showPointDialog, setShowPointDialog] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (session?.user) {
      fetchUserPoints();
    }
  }, [session]);

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/points/total');
      if (!response.ok) throw new Error('포인트 조회에 실패했습니다.');
      const data = await response.json();
      setTotalPoints(data.points);
    } catch (error) {
      console.error('Failed to fetch points:', error);
    }
  };

  const awardPoints = async (type: keyof typeof POINT_RULES) => {
    if (!session?.user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch('/api/points/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) throw new Error('포인트 적립에 실패했습니다.');
      
      const data = await response.json();
      setEarnedPoints(POINT_RULES[type]);
      setShowPointDialog(true);
      setTotalPoints(prev => prev + POINT_RULES[type]);
      
      setTimeout(() => {
        setShowPointDialog(false);
        setEarnedPoints(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to award points:', error);
      toast.error('포인트 적립에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            내 포인트
          </CardTitle>
          <CardDescription>
            공구 참여, 공유, 리뷰 작성으로 포인트를 모아보세요!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {totalPoints.toLocaleString()} P
          </div>
          
          <div className="mt-6 space-y-4">
            <h3 className="font-medium">포인트 적립 방법</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="font-medium">공구 참여</p>
                  <p className="text-sm text-gray-500">
                    {POINT_RULES.PARTICIPATION}P 적립
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Share2 className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">공구 공유</p>
                  <p className="text-sm text-gray-500">
                    {POINT_RULES.SHARE}P 적립
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Trophy className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium">리뷰 작성</p>
                  <p className="text-sm text-gray-500">
                    {POINT_RULES.REVIEW}P 적립
                  </p>
                </div>
              </div>
            </div>
          </div>

          {activities.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-4">최근 적립 내역</h3>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex justify-between items-center p-3 rounded-lg bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-primary font-medium">
                      +{activity.points}P
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {showPointDialog && (
          <Dialog open={showPointDialog} onOpenChange={setShowPointDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>포인트 적립 완료! 🎉</DialogTitle>
                <DialogDescription>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="text-center py-6"
                  >
                    <p className="text-2xl font-bold text-primary mb-2">
                      +{earnedPoints}P
                    </p>
                    <p className="text-gray-600">
                      포인트가 적립되었습니다!
                    </p>
                  </motion.div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
