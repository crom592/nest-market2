'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { 
  Users, 
  Clock, 
  Lock, 
  Search, 
  Grid, 
  Smartphone, 
  Tv, 
  Wifi, 
  Package, 
  MoreHorizontal,
  Heart,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/date';

// Define types
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
  currentPrice: number;
  category: string;
  supportAmount?: number;
  wishlistCount?: number;
  bidCount?: number;
  voteStatus?: string;
}

interface GroupPurchaseGridProps {
  purchases: GroupPurchaseWithCounts[];
  isLoading?: boolean;
}

// Sort options
const SORT_OPTIONS = {
  POPULAR: { id: 'popular', name: '인기순' },
  TIME_LEFT: { id: 'timeLeft', name: '마감임박순' },
  PARTICIPANTS: { id: 'participants', name: '참여 인원순' }
};

// Category options
const CATEGORIES = [
  { id: 'all', name: '전체', icon: Grid },
  { id: 'electronics', name: '전자제품', icon: Smartphone },
  { id: 'home', name: '가전제품', icon: Tv },
  { id: 'mobile', name: '휴대폰/인터넷', icon: Wifi },
  { id: 'rental', name: '렌탈', icon: Package },
  { id: 'etc', name: '기타', icon: MoreHorizontal },
] as const;

const GroupPurchaseGrid: React.FC<GroupPurchaseGridProps> = ({ purchases, isLoading = false }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<keyof typeof SORT_OPTIONS>('POPULAR');
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized filtered and sorted purchases
  const processedPurchases = useMemo(() => {
    if (isLoading) return [];

    let filtered = purchases;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(purchase => purchase.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(purchase => 
        purchase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchase.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort purchases
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'POPULAR':
          return b.currentParticipants - a.currentParticipants;
        case 'TIME_LEFT':
          const timeA = a.auctionEndTime ? new Date(a.auctionEndTime).getTime() : Infinity;
          const timeB = b.auctionEndTime ? new Date(b.auctionEndTime).getTime() : Infinity;
          return timeA - timeB;
        case 'PARTICIPANTS':
          return b.currentParticipants - a.currentParticipants;
        default:
          return 0;
      }
    });
  }, [purchases, selectedCategory, sortBy, searchQuery, isLoading]);

  // Render loading skeletons if loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="relative h-48 w-full bg-gray-200" />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg bg-gray-200 h-4 w-3/4" />
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm bg-gray-200 h-4 w-1/2" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render empty state if no purchases
  if (!purchases || purchases.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        현재 진행 중인 공구가 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Category Navigation */}
      <div className="mb-4">
        <div className="flex flex-col space-y-3">
          {/* Main Categories */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-1.5 rounded-full transition-colors whitespace-nowrap text-sm ${
                    selectedCategory === category.id
                      ? 'bg-[#8046F1] text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <CategoryIcon className="h-3.5 w-3.5 mr-1.5" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center justify-between border-b">
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
              <button className={`pb-2 text-xs font-medium border-b-2 whitespace-nowrap ${selectedCategory === 'all' ? 'text-[#8046F1] border-[#8046F1]' : 'text-gray-500 border-transparent'}`}>
                전체
              </button>
              <button className={`pb-2 text-xs font-medium border-b-2 whitespace-nowrap ${selectedCategory === 'ongoing' ? 'text-[#8046F1] border-[#8046F1]' : 'text-gray-500 border-transparent'}`}>
                진행중인 공구
              </button>
              <button className={`pb-2 text-xs font-medium border-b-2 whitespace-nowrap ${selectedCategory === 'completed' ? 'text-[#8046F1] border-[#8046F1]' : 'text-gray-500 border-transparent'}`}>
                완료된 공구
              </button>
              <button className={`pb-2 text-xs font-medium border-b-2 whitespace-nowrap ${selectedCategory === 'mypage' ? 'text-[#8046F1] border-[#8046F1]' : 'text-gray-500 border-transparent'}`}>
                마이페이지
              </button>
            </div>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as keyof typeof SORT_OPTIONS)}
              className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8046F1]"
            >
              {Object.entries(SORT_OPTIONS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3">
        {processedPurchases.map((purchase) => (
          <div key={purchase.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Product Image */}
            <div className="relative aspect-square w-full group">
              <Image
                src={purchase.imageUrl || '/placeholder.png'}
                alt={purchase.title}
                layout="fill"
                objectFit="cover"
                className="bg-gray-50"
              />
              <div className="absolute top-2 right-2 flex gap-1.5">
                <button className="p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm">
                  <Heart className={`h-4 w-4 ${purchase.wishlistCount ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
                <button className="p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm">
                  <Share2 className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-3 space-y-2">
              {/* Title */}
              <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">
                {purchase.title}
              </h3>

              {/* Price and Support Amount */}
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-[#FF4B50] font-bold text-sm">
                    {purchase.targetPrice && purchase.currentPrice 
                      ? `${Math.round((1 - purchase.currentPrice / purchase.targetPrice) * 100)}%`
                      : '-'}
                  </span>
                  <span className="font-bold text-base">
                    {purchase.currentPrice ? purchase.currentPrice.toLocaleString() : purchase.targetPrice?.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-900">원</span>
                </div>
                {purchase.supportAmount && (
                  <div className="text-xs text-purple-600 font-medium">
                    + {purchase.supportAmount.toLocaleString()}원 지원
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full"
                    style={{ 
                      width: `${Math.min((purchase.currentParticipants / purchase.maxParticipants) * 100, 100)}%`
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-0.5" />
                    {purchase.currentParticipants ?? 0}/{purchase.maxParticipants ?? '-'}명
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-0.5" />
                    {purchase.auctionEndTime ? formatDate(purchase.auctionEndTime) : '마감 시간 미정'}
                  </span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-1.5">
                {purchase.bidCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded-full">
                    입찰 {purchase.bidCount}건
                  </span>
                )}
                {purchase.voteStatus && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-yellow-50 text-yellow-600 rounded-full">
                    투표중
                  </span>
                )}
              </div>

              {/* Action Button */}
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-[#FF4B50] text-white hover:bg-[#E64447] text-xs px-3 py-1.5 h-8 font-medium"
              >
                공구 참여하기
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupPurchaseGrid;
