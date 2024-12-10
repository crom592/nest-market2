import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface BidFormProps {
  groupPurchaseId: string;
  onBidSubmitted: (bid: BidData) => void;
}

interface BidFormData {
  price: number;
  description: string;
}

interface BidData {
  id: string;
  price: number;
  description: string;
  userId: string;
  groupPurchaseId: string;
  createdAt: Date;
}

export default function BidForm({ groupPurchaseId, onBidSubmitted }: BidFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit } = useForm<BidFormData>();

  const onSubmit = async (data: BidFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          groupPurchaseId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit bid');
      }

      const result = await response.json();
      onBidSubmitted(result.bid);
      toast.success('입찰이 완료되었습니다!');
    } catch (error) {
      console.error('Failed to submit bid:', error);
      toast.error('입찰 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">입찰하기</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">
            입찰가격
          </label>
          <Input
            id="price"
            type="number"
            {...register('price', {
              required: '입찰가격을 입력해주세요',
              min: { value: 0, message: '0원 이상 입력해주세요' },
            })}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            입찰 설명
          </label>
          <Textarea
            id="description"
            {...register('description', {
              required: '입찰 설명을 입력해주세요',
            })}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '입찰 중...' : '입찰하기'}
        </Button>
      </form>
    </div>
  );
}
