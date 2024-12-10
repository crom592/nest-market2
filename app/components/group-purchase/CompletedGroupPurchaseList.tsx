'use client';

import { useState } from 'react';
import { GroupPurchase, User } from '@prisma/client';
import { Star, StarHalf } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ExtendedGroupPurchase extends GroupPurchase {
  creator: User;
  participants: { user: User }[];
  finalPrice: number;
  rating?: number;
  review?: string;
}

interface CompletedGroupPurchaseListProps {
  purchases: ExtendedGroupPurchase[];
  isLoading?: boolean;
}

export default function CompletedGroupPurchaseList({
  purchases = [],
  isLoading = false,
}: CompletedGroupPurchaseListProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  
  // Filter purchases from the last 3 months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const filteredPurchases = purchases.filter(purchase => {
    const purchaseDate = new Date(purchase.endTime);
    return purchaseDate >= threeMonthsAgo;
  });

  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-yellow-400 text-yellow-400" />);
    }

    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((index) => (
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

  if (filteredPurchases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">최근 3개월 동안 완료된 공구가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPurchases.map((purchase) => (
          <div
            key={purchase.id}
            className="bg-white rounded-lg shadow-md p-4 opacity-75"
          >
            <div className="relative">
              <img 
                src={purchase.imageUrl || '/placeholder.png'} 
                alt={purchase.title}
                className="w-full h-48 object-cover rounded-md grayscale"
              />
              <div className="absolute top-2 right-2">
                <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                  완료
                </span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mt-4">{purchase.title}</h3>
            <p className="text-gray-600">
              최종가격: {purchase.finalPrice.toLocaleString()}원
            </p>
            
            {purchase.rating && (
              <div className="mt-2">
                {renderRating(purchase.rating)}
                {purchase.review && (
                  <p className="text-sm text-gray-600 mt-1">{purchase.review}</p>
                )}
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
              <span>
                참여 {purchase.participants.length}명
              </span>
              <span>
                {formatDistanceToNow(new Date(purchase.endTime), {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
