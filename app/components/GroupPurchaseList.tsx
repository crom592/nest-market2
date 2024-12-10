'use client';

import React, { useState, useEffect } from 'react';
import { ProductCategory, PurchaseStatus } from '@prisma/client';
import GroupPurchaseCard from './GroupPurchaseCard';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface GroupPurchase {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  status: PurchaseStatus;
  startAt: Date;
  endAt: Date;
  targetPrice: number;
  currentPrice: number;
  popularity: number;
  participantCount: number;
  creatorId: string;
}

export default function GroupPurchaseList() {
  const [groupPurchases, setGroupPurchases] = useState<GroupPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터링 상태
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<PurchaseStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchGroupPurchases() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/group-purchases/filter', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('그룹 구매 데이터를 불러오는 데 실패했습니다.');
        }

        const data = await response.json();
        setGroupPurchases(data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching group purchases:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchGroupPurchases();
  }, [selectedCategory, selectedStatus, searchQuery]);

  const handleFilter = () => {
    // 필터링 트리거 (useEffect에 의해 자동 실행)
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
        <Button onClick={() => window.location.reload()} className="ml-2">
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* 카테고리 필터 */}
        <Select 
          value={selectedCategory} 
          onValueChange={(value) => setSelectedCategory(value as ProductCategory | 'ALL')}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 카테고리</SelectItem>
            {Object.values(ProductCategory).map((category) => (
              <SelectItem key={category} value={category}>
                {getCategoryLabel(category)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 상태 필터 */}
        <Select 
          value={selectedStatus} 
          onValueChange={(value) => setSelectedStatus(value as PurchaseStatus | 'ALL')}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="상태 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 상태</SelectItem>
            {Object.values(PurchaseStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 검색 입력란 */}
        <div className="flex w-full gap-2">
          <Input 
            type="text" 
            placeholder="그룹 구매 검색" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={handleFilter}>검색</Button>
        </div>
      </div>

      {groupPurchases.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          조건에 맞는 그룹 구매가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupPurchases.map((purchase) => (
            <GroupPurchaseCard key={purchase.id} purchase={purchase} />
          ))}
        </div>
      )}
    </div>
  );
}

// 카테고리 라벨 변환 함수
function getCategoryLabel(category: ProductCategory): string {
  const categoryLabels: Record<ProductCategory, string> = {
    ELECTRONICS: '전자제품',
    HOME_APPLIANCE: '가전제품',
    COMMUNICATION: '통신기기',
    RENTAL: '렌탈',
    FASHION: '패션',
    FOOD: '식품',
    TRAVEL: '여행',
    ETC: '기타'
  };
  return categoryLabels[category];
}

// 상태 라벨 변환 함수
function getStatusLabel(status: PurchaseStatus): string {
  const statusLabels: Record<PurchaseStatus, string> = {
    DRAFT: '초안',
    RECRUITING: '모집 중',
    BIDDING: '입찰 중',
    VOTING: '투표 중',
    CONFIRMED: '확정됨',
    IN_PROGRESS: '진행 중',
    COMPLETED: '완료',
    CANCELLED: '취소됨'
  };
  return statusLabels[status];
}
