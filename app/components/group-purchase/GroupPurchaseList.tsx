'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GroupPurchase } from '@prisma/client';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Heart, Share2 } from 'lucide-react';

interface GroupPurchaseListProps {
  purchases?: GroupPurchase[];
  isLoading?: boolean;
  categories?: string[];
}

export default function GroupPurchaseList({ 
  purchases = [], 
  isLoading = false,
  categories = []
}: GroupPurchaseListProps) {
  const [sortBy, setSortBy] = useState('latest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFavorite = (purchaseId: string) => {
    setFavorites(prev => 
      prev.includes(purchaseId) 
        ? prev.filter(id => id !== purchaseId)
        : [...prev, purchaseId]
    );
  };

  const handleShare = async (purchase: GroupPurchase) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: purchase.title,
          text: `${purchase.title} 공구에 참여해보세요!`,
          url: `/group-purchases/${purchase.id}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const sortedPurchases = [...purchases].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.participants?.length || 0) - (a.participants?.length || 0);
      case 'timeLeft':
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      case 'participants':
        return (b.participants?.length || 0) - (a.participants?.length || 0);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const filteredPurchases = sortedPurchases.filter(purchase => 
    selectedCategory === 'all' || purchase.category === selectedCategory
  );

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-md p-4 animate-pulse"
          >
            <div className="h-48 w-full bg-gray-200 rounded-md mb-4" />
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
            <div className="h-4 w-1/4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">아직 진행중인 공구가 없습니다.</p>
        <Link
          href="/group-purchases/create"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90"
        >
          첫 공구 만들기
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex gap-4 items-center">
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          options={[
            { value: 'all', label: '전체 카테고리' },
            ...categories.map(cat => ({ value: cat, label: cat }))
          ]}
        />
        <Select
          value={sortBy}
          onValueChange={setSortBy}
          options={[
            { value: 'latest', label: '최신순' },
            { value: 'popular', label: '인기순' },
            { value: 'timeLeft', label: '남은시간순' },
            { value: 'participants', label: '참여인원순' }
          ]}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPurchases.map((purchase) => (
          <motion.div
            key={purchase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-4"
          >
            <div className="relative">
              <img 
                src={purchase.imageUrl || '/placeholder.png'} 
                alt={purchase.title}
                className="w-full h-48 object-cover rounded-md"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFavorite(purchase.id)}
                >
                  <Heart 
                    className={favorites.includes(purchase.id) ? 'fill-red-500 text-red-500' : ''} 
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleShare(purchase)}
                >
                  <Share2 />
                </Button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mt-4">{purchase.title}</h3>
            <p className="text-gray-600">{purchase.expectedPrice.toLocaleString()}원</p>
            
            <div className="mt-2">
              <div className="h-2 w-full bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-primary rounded-full" 
                  style={{ width: `${((new Date().getTime() - new Date(purchase.startTime).getTime()) / (new Date(purchase.endTime).getTime() - new Date(purchase.startTime).getTime())) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(purchase.endTime).toLocaleDateString()}
              </p>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                참여 {purchase.currentParticipants}/{purchase.maxParticipants}명
              </span>
              <Link
                href={`/group-purchases/${purchase.id}`}
                className="text-primary hover:underline"
              >
                자세히 보기
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
