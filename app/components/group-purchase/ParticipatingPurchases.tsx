'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Share2, Users, Clock, TrendingUp, LogOut } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'react-toastify';

interface GroupPurchaseWithCounts {
  id: string;
  name: string;
  description: string;
  mainImage: string;
  price: number;
  subsidy?: number;
  maxParticipants?: number;
  startTime: Date;
  endTime: Date;
  category: string;
  status: string;
  _count: {
    participants: number;
    bids: number;
    votes: number;
  };
  creator: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  currentBid?: {
    price: number;
    rank: number;
  };
}

const WITHDRAWAL_REASONS = [
  { id: 'price', label: '가격이 너무 높아서' },
  { id: 'schedule', label: '일정이 맞지 않아서' },
  { id: 'change_mind', label: '구매 의사가 바뀌어서' },
  { id: 'better_option', label: '더 좋은 옵션을 찾아서' },
  { id: 'other', label: '기타 사유' },
];

export default function ParticipatingPurchases() {
  const [purchases, setPurchases] = useState<GroupPurchaseWithCounts[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<GroupPurchaseWithCounts | null>(null);
  const [showRankings, setShowRankings] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParticipatingPurchases = async () => {
      try {
        const response = await fetch('/api/group-purchases/participating');
        if (!response.ok) throw new Error('Failed to fetch participating purchases');
        const data = await response.json();
        setPurchases(data.groupPurchases);
      } catch (error) {
        console.error('Failed to fetch participating purchases:', error);
        toast.error('참여중인 공구 목록을 불러오는데 실패했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipatingPurchases();
  }, []);

  const handleShare = async (purchase: GroupPurchaseWithCounts) => {
    try {
      await navigator.share({
        title: purchase.name,
        text: purchase.description,
        url: window.location.href,
      });
      toast.success('공유되었습니다');
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('공유하기에 실패했습니다');
    }
  };

  const handleWithdraw = async () => {
    if (!selectedPurchase || !withdrawalReason) return;

    try {
      const response = await fetch(`/api/group-purchases/${selectedPurchase.id}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: withdrawalReason }),
      });

      if (!response.ok) throw new Error('Failed to withdraw from group purchase');

      setPurchases((prev) => prev.filter((p) => p.id !== selectedPurchase.id));
      setShowWithdrawal(false);
      setWithdrawalReason('');
      toast.success('공구 참여가 취소되었습니다');
    } catch (error) {
      console.error('Failed to withdraw:', error);
      toast.error('공구 참여 취소에 실패했습니다');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg" />
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full mt-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purchases.map((purchase) => (
          <Card key={purchase.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={purchase.mainImage}
                alt={purchase.name}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{purchase.name}</CardTitle>
              <CardDescription>
                {formatDistanceToNow(new Date(purchase.endTime), {
                  addSuffix: true,
                  locale: ko,
                })}
                까지
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{purchase.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>참여자</span>
                  <span>
                    {purchase._count.participants}
                    {purchase.maxParticipants && ` / ${purchase.maxParticipants}`}
                  </span>
                </div>
                {purchase.maxParticipants && (
                  <Progress
                    value={(purchase._count.participants / purchase.maxParticipants) * 100}
                  />
                )}
                <div className="flex justify-between text-sm">
                  <span>현재 순위</span>
                  <span>
                    {purchase.currentBid
                      ? `${purchase.currentBid.rank}위 (${purchase.currentBid.price.toLocaleString()}원)`
                      : '입찰 없음'}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => handleShare(purchase)}>
                <Share2 className="h-4 w-4 mr-2" />
                공유하기
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setSelectedPurchase(purchase);
                  setShowWithdrawal(true);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                참여 취소
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={showWithdrawal} onOpenChange={setShowWithdrawal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>공구 참여 취소</DialogTitle>
            <DialogDescription>
              공구 참여를 취소하시겠습니까? 취소 사유를 선택해주세요.
            </DialogDescription>
          </DialogHeader>
          <Select value={withdrawalReason} onValueChange={setWithdrawalReason}>
            <SelectTrigger>
              <SelectValue placeholder="취소 사유 선택" />
            </SelectTrigger>
            <SelectContent>
              {WITHDRAWAL_REASONS.map((reason) => (
                <SelectItem key={reason.id} value={reason.id}>
                  {reason.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawal(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleWithdraw} disabled={!withdrawalReason}>
              참여 취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
