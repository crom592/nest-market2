'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import ProductSearch from './ProductSearch';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { Loader2 } from "lucide-react";

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const formSchema = z.object({
  title: z.string().min(1, '제품/서비스 이름을 입력해주세요'),
  description: z.string().min(1, '제품/서비스 내용을 입력해주세요'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  bidType: z.enum(['PRICE_ONLY', 'PRICE_AND_SUPPORT']),
  startPrice: z.number().min(0, '시작 가격은 0 이상이어야 합니다'),
  supportAmount: z.number().optional(),
  startTime: z.string(),
  endTime: z.string(),
  maxParticipants: z.number().min(2, '최소 2명 이상의 참여자가 필요합니다'),
  imageUrl: z.string().optional(),
  minParticipants: z.number().min(2, '최소 2명 이상이어야 합니다'),
  expectedPrice: z.number().min(1000, '1,000원 이상이어야 합니다').max(100000000, '1억원 이하여야 합니다'),
  auctionDuration: z.number().min(24, '최소 24시간 이상이어야 합니다'),
});

type FormValues = z.infer<typeof formSchema>;

const AUTOSAVE_DELAY = 1000; // 1초

export default function CreateGroupPurchaseForm() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bidType: 'PRICE_ONLY',
      maxParticipants: 2,
      minParticipants: 2,
      auctionDuration: 24,
    },
  });

  // 자동 저장된 데이터 불러오기
  useEffect(() => {
    const savedData = localStorage.getItem('groupPurchaseFormDraft');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        form.reset(parsedData);
      } catch (error) {
        console.error('Failed to load saved form data:', error);
      }
    }
  }, []);

  // 폼 데이터 변경 시 자동 저장
  useEffect(() => {
    const subscription = form.watch((value) => {
      const saveTimer = setTimeout(() => {
        localStorage.setItem('groupPurchaseFormDraft', JSON.stringify(value));
        setIsSaving(false);
      }, AUTOSAVE_DELAY);

      setIsSaving(true);
      return () => clearTimeout(saveTimer);
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (values: FormValues) => {
    if (!values.title || !values.description || !values.category) {
      toast.error('제품/서비스 정보를 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/group-purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('공구 등록에 실패했습니다.');
      }

      // 등록 성공 시 자동 저장 데이터 삭제
      localStorage.removeItem('groupPurchaseFormDraft');
      
      toast.success('공구가 등록되었습니다!');
      router.push('/group-purchases');
    } catch (error) {
      console.error('Failed to create group purchase:', error);
      toast.error(error instanceof Error ? error.message : '등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    form.setValue('title', product.name);
    form.setValue('category', product.category);
    if (product.imageUrl) {
      form.setValue('imageUrl', product.imageUrl);
    }
  };

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className="w-full bg-white rounded-lg p-6"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <FormLabel>제품/서비스 검색</FormLabel>
            <ProductSearch onSelect={handleProductSelect} />
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>제품/서비스 이름 *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>제품/서비스 내용 *</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bidType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>입찰 방식 *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="PRICE_ONLY" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        가격만
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="PRICE_AND_SUPPORT" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        가격 + 지원금
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="startPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>시작 가격 *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('bidType') === 'PRICE_AND_SUPPORT' && (
              <FormField
                control={form.control}
                name="supportAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>지원금</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>시작 시간 *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>종료 시간 *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="minParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>최소 참여자 수 *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>최대 참여자 수 *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="expectedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>예상 가격 *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="auctionDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>입찰 기간 *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between items-center">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              공구 등록하기
            </Button>
          </div>

          {isSaving && (
            <p className="text-sm text-gray-500 text-center">
              임시 저장 중...
            </p>
          )}
        </form>
      </Form>
    </motion.div>
  );
}
