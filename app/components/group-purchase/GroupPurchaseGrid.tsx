'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Users, Clock } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { formatDate } from '@/lib/utils/date';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface GroupPurchaseWithCounts {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  targetPrice: number;
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  auctionStartTime: string | null;
  auctionEndTime: string | null;
  voteStartTime: string | null;
  voteEndTime: string | null;
  voteThreshold: number;
  creator: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
  _count: {
    participants: number;
    bids: number;
    votes: number;
  };
}

interface GroupPurchaseGridProps {
  purchases: GroupPurchaseWithCounts[];
  isLoading?: boolean;
}

const SORT_OPTIONS = {
  POPULAR: 'popular',
  TIME_LEFT: 'timeLeft',
  PARTICIPANTS: 'participants',
} as const;

const CATEGORIES = [
  { id: 'all', name: '전체' },
  { id: 'electronics', name: '전자기기' },
  { id: 'fashion', name: '패션' },
  { id: 'food', name: '식품' },
  { id: 'beauty', name: '뷰티' },
  { id: 'etc', name: '기타' },
] as const;

export default function GroupPurchaseGrid({ purchases, isLoading = false }: GroupPurchaseGridProps) {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<keyof typeof SORT_OPTIONS>('POPULAR');

  const filteredPurchases = purchases.filter((purchase) => {
    if (selectedCategory === 'all') return true;
    return purchase.title === selectedCategory;
  });

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    switch (sortBy) {
      case 'POPULAR':
        return (b._count.participants + b._count.votes) - (a._count.participants + a._count.votes);
      case 'TIME_LEFT':
        return new Date(a.auctionEndTime).getTime() - new Date(b.auctionEndTime).getTime();
      case 'PARTICIPANTS':
        return b._count.participants - a._count.participants;
      default:
        return 0;
    }
  });

  const handleShare = async (purchase: GroupPurchaseWithCounts) => {
    try {
      await navigator.share({
        title: purchase.title,
        text: purchase.description,
        url: window.location.href,
      });
      toast.success('공유되었습니다');
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('공유하기에 실패했습니다');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as keyof typeof SORT_OPTIONS)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="정렬 기준" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="POPULAR">인기순</SelectItem>
            <SelectItem value="TIME_LEFT">마감임박순</SelectItem>
            <SelectItem value="PARTICIPANTS">참여자순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {sortedPurchases.map((purchase) => (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={purchase.imageUrl}
                      alt={purchase.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{purchase.title}</CardTitle>
                    <CardDescription>
                      {formatDate(purchase.auctionEndTime)}까지
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
                        <span>가격</span>
                        <span>{purchase.targetPrice.toLocaleString()}원</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleShare(purchase)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      공유하기
                    </Button>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {purchase._count.participants}
                      </span>
                      <span className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(purchase.auctionEndTime)}
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
