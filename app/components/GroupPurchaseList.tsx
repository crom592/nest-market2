'use client';

import React, { useState, useEffect } from 'react';
import { ProductCategory, PurchaseStatus } from '@prisma/client';
import GroupPurchaseGrid from '@/components/group-purchase/GroupPurchaseGrid';
import { Input } from '@/components/ui/input';

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
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation tabs
  const tabs = [
    { id: 'ALL', label: '전체' },
    { id: 'ONGOING', label: '진행중인 공구' },
    { id: 'COMPLETED', label: '완료된 공구' },
    { id: 'MY', label: '마이페이지' },
  ];

  useEffect(() => {
    fetchGroupPurchases();
  }, [activeTab]);

  async function fetchGroupPurchases() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/group-purchases/filter?status=${activeTab}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch group purchases');
      }

      const data = await response.json();
      setGroupPurchases(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching group purchases:', err);
      setError('그룹 구매 데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4">
      {/* Navigation Tabs */}
      <nav className="flex space-x-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-center py-4 mb-4">
          {error}
        </div>
      )}

      {/* Group Purchase Grid */}
      <GroupPurchaseGrid purchases={groupPurchases} isLoading={isLoading} />
    </div>
  );
}
