'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Star, MessageSquare } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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
    reviews: number;
  };
  creator: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  review?: {
    rating: number;
    content: string;
  };
}

export default function CompletedPurchases() {
  const [purchases, setPurchases] = useState<GroupPurchaseWithCounts[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<GroupPurchaseWithCounts | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedPurchases = async () => {
      try {
        const response = await fetch('/api/group-purchases/completed');
        if (!response.ok) throw new Error('Failed to fetch completed purchases');
        const data = await response.json();
        setPurchases(data.groupPurchases);
      } catch (error) {
        console.error('Failed to fetch completed purchases:', error);
        toast.error('완료된 공구 목록을 불러오는데 실패했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedPurchases();
  }, []);

  const handleReviewSubmit = async () => {
    if (!selectedPurchase || !rating || !review) return;

    try {
      const response = await fetch(`/api/group-purchases/${selectedPurchase.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, content: review }),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      setPurchases((prev) =>
        prev.map((p) =>
          p.id === selectedPurchase.id
            ? { ...p, review: { rating, content: review }, _count: { ...p._count, reviews: p._count.reviews + 1 } }
            : p
        )
      );

      setShowReview(false);
      setRating(0);
      setReview('');
      toast.success('리뷰가 등록되었습니다');
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('리뷰 등록에 실패했습니다');
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
                에 완료
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{purchase.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>최종 가격</span>
                  <span>{purchase.price.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>참여자 수</span>
                  <span>{purchase._count.participants}명</span>
                </div>
                {purchase.review ? (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < purchase.review!.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{purchase.review.content}</p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedPurchase(purchase);
                      setShowReview(true);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    리뷰 작성하기
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>리뷰 작성</DialogTitle>
            <DialogDescription>
              공구 참여 경험을 공유해주세요. 다른 참여자들에게 도움이 됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">평점</label>
              <div className="flex items-center gap-2 mt-2">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">리뷰 내용</label>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="공구 참여 경험을 자세히 적어주세요"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReview(false)}>
              취소
            </Button>
            <Button onClick={handleReviewSubmit} disabled={!rating || !review}>
              등록하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
