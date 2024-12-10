'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GroupPurchase, Bid, User, PurchaseStatus } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import BidForm from './BidForm';
import ChatRoom from './ChatRoom';
import { Share2, Heart, Trash2, Edit2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExtendedBid extends Bid {
  seller: User & {
    rating: number;
    bidCount: number;
    points: number;
  };
}

interface ExtendedUser extends User {
  role: 'CONSUMER' | 'SELLER' | 'ADMIN';
  penaltyCount: number;
  penaltyEndTime: Date | null;
}

interface GroupPurchaseDetailProps {
  groupPurchase: GroupPurchase & {
    creator: ExtendedUser;
    participants: { user: ExtendedUser }[];
    bids: ExtendedBid[];
    votes: { user: { id: string; name: string } }[];
    messages: {
      sender: {
        id: string;
        name: string;
        role: string;
      };
      content: string;
      createdAt: Date;
    }[];
  };
  isParticipant: boolean;
  hasVoted: boolean;
  canBid: boolean;
  canVote: boolean;
  canParticipate: boolean;
}

const STATUS_MAP: Record<PurchaseStatus, { label: string; color: string }> = {
  RECRUITING: { label: '모집중', color: 'bg-blue-500' },
  BIDDING: { label: '입찰중', color: 'bg-yellow-500' },
  VOTING: { label: '투표중', color: 'bg-purple-500' },
  CONFIRMED: { label: '확정', color: 'bg-green-500' },
  COMPLETED: { label: '완료', color: 'bg-gray-500' },
  CANCELLED: { label: '취소됨', color: 'bg-red-500' },
};

export default function GroupPurchaseDetail({
  groupPurchase: initialGroupPurchase,
  isParticipant: initialIsParticipant,
  hasVoted: initialHasVoted,
  canBid,
  canVote,
  canParticipate,
}: GroupPurchaseDetailProps) {
  const { data: session } = useSession();
  const [groupPurchase, setGroupPurchase] = useState(initialGroupPurchase);
  const [isParticipant, setIsParticipant] = useState(initialIsParticipant);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPenaltyDialog, setShowPenaltyDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const isLeader = session?.user?.id === initialGroupPurchase.creator.id;
  const canDelete = isLeader && initialGroupPurchase.participants.length <= 1;
  const canEdit = isLeader && initialGroupPurchase.participants.length <= 1;

  const handleShare = async () => {
    const shareData = {
      title: initialGroupPurchase.title,
      text: `${initialGroupPurchase.title} 공구에 참여해보세요!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        const platforms = [
          { name: 'KakaoTalk', url: `https://story.kakao.com/share?url=${encodeURIComponent(window.location.href)}` },
          { name: 'Twitter', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(window.location.href)}` },
          { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
        ];
        
        // Show sharing dialog with platform options
        // Implementation details...
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('공유하기에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      toast.error('참여자가 있어 삭제할 수 없습니다.');
      return;
    }

    try {
      await fetch(`/api/group-purchases/${initialGroupPurchase.id}`, {
        method: 'DELETE',
      });
      toast.success('공구가 삭제되었습니다.');
      // Redirect to list page
      window.location.href = '/group-purchases';
    } catch (error) {
      console.error('Error deleting group purchase:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleParticipate = async () => {
    setShowPenaltyDialog(true);
  };

  const confirmParticipation = async () => {
    try {
      const response = await fetch(`/api/group-purchases/${initialGroupPurchase.id}/participate`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to participate');
      }

      toast.success('공구 참여가 완료되었습니다.');
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error participating in group purchase:', error);
      toast.error('참여에 실패했습니다.');
    }
  };

  // Timer for auction/vote end time
  useEffect(() => {
    const endTime = groupPurchase.status === 'VOTING' 
      ? groupPurchase.voteEndTime 
      : groupPurchase.auctionEndTime;

    if (!endTime) return;

    const timer = setInterval(() => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('종료됨');
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}시간 ${minutes}분 ${seconds}초`);
    }, 1000);

    return () => clearInterval(timer);
  }, [groupPurchase?.status, groupPurchase?.auctionEndTime, groupPurchase?.voteEndTime]);

  const renderStatus = () => {
    const status = STATUS_MAP[groupPurchase.status];
    return (
      <Badge className={`${status.color} text-white`}>
        {status.label}
      </Badge>
    );
  };

  const renderParticipationProgress = () => {
    const progress = (groupPurchase.currentParticipants / groupPurchase.maxParticipants) * 100;
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>참여자 현황</span>
          <span>{groupPurchase.currentParticipants}/{groupPurchase.maxParticipants}명</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    );
  };

  const renderBids = () => {
    if (groupPurchase.bids.length === 0) {
      return <p className="text-gray-500">아직 입찰이 없습니다.</p>;
    }

    return (
      <div className="space-y-4">
        {groupPurchase.bids.map((bid) => (
          <div key={bid.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{bid.seller.name}</p>
                <p className="text-sm text-gray-600">
                  평점: {bid.seller.rating.toFixed(1)} | 입찰 수: {bid.seller.bidCount}
                </p>
              </div>
              <p className="text-lg font-bold">{bid.price.toLocaleString()}원</p>
            </div>
            <p className="mt-2 text-gray-700">{bid.description}</p>
            <p className="mt-1 text-sm text-gray-500">
              {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true, locale: ko })}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderVotingStatus = () => {
    if (groupPurchase.status !== 'VOTING') return null;

    const approvedCount = groupPurchase.votes.filter(v => v.approved).length;
    const totalVotes = groupPurchase.votes.length;
    const progress = (totalVotes / groupPurchase.currentParticipants) * 100;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>투표 현황</span>
            <span>{totalVotes}/{groupPurchase.currentParticipants}명</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <p className="text-center">
          찬성: {approvedCount}명 | 반대: {totalVotes - approvedCount}명
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">{groupPurchase.title}</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
              <Heart className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 />
            </Button>
            {isLeader && (
              <>
                {canEdit && (
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                    <Edit2 />
                  </Button>
                )}
                {canDelete && (
                  <Button variant="ghost" size="icon" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="text-red-500" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mb-6">
          <Progress 
            value={
              ((new Date().getTime() - new Date(groupPurchase.startTime).getTime()) /
              (new Date(groupPurchase.endTime).getTime() - new Date(groupPurchase.startTime).getTime())) * 100
            } 
          />
          <p className="text-sm text-gray-500 mt-2">
            {formatDistanceToNow(new Date(groupPurchase.endTime), { addSuffix: true, locale: ko })}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">참여자 ({groupPurchase.participants.length}명)</h2>
          <div className="flex flex-wrap gap-2">
            {groupPurchase.participants.map(({ user }) => (
              <div key={user.id} className="flex items-center gap-1">
                <Badge variant={user.role === 'SELLER' ? 'secondary' : 'default'}>
                  {user.name}
                  {user.role === 'SELLER' && ' '}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {canParticipate && (
          <Button
            className="w-full"
            onClick={handleParticipate}
          >
            공구 참여하기
          </Button>
        )}

        <Dialog
          open={showPenaltyDialog}
          onOpenChange={setShowPenaltyDialog}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">공구 참여 전 확인사항</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">패널티 정책</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600">
                  <li>입찰건이 1건 이상일 경우 탈퇴 시 패널티가 부과됩니다.</li>
                  <li>공구 최종 진행 결정 후 노쇼 시 패널티가 부과됩니다.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium">패널티 내용</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600">
                  <li>공구 참여 제한 (7일)</li>
                  <li>평가 점수 감점</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPenaltyDialog(false)}>
                취소
              </Button>
              <Button onClick={confirmParticipation}>
                동의 후 참여하기
              </Button>
            </div>
          </div>
        </Dialog>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>공구를 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {groupPurchase.status === 'BIDDING' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">입찰 현황</h2>
            {renderBids()}
            {canBid && <BidForm groupPurchaseId={groupPurchase.id} onBidSubmitted={(bid) => {
              setGroupPurchase(prev => ({
                ...prev,
                bids: [...prev.bids, bid],
              }));
            }} />}
          </div>
        )}

        {groupPurchase.status === 'VOTING' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">투표</h2>
            {renderVotingStatus()}
            {canVote && !hasVoted && (
              <div className="flex space-x-4">
                <Button
                  onClick={() => handleVote(true)}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  찬성
                </Button>
                <Button
                  onClick={() => handleVote(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  반대
                </Button>
              </div>
            )}
          </div>
        )}

        {isParticipant && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">채팅</h2>
            <ChatRoom
              groupPurchaseId={groupPurchase.id}
              initialMessages={groupPurchase.messages}
            />
          </div>
        )}
      </div>
    </div>
  );
}
