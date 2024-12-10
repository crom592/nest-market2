'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Pin } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const noticeFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  category: z.enum(['GENERAL', 'EVENT', 'UPDATE', 'IMPORTANT']),
  isPinned: z.boolean().default(false),
});

type NoticeFormValues = z.infer<typeof noticeFormSchema>;

const defaultValues: Partial<NoticeFormValues> = {
  category: 'GENERAL',
  isPinned: false,
};

interface CreateNoticeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: NoticeFormValues) => Promise<void>;
}

export default function CreateNotice({
  open,
  onOpenChange,
  onSubmit,
}: CreateNoticeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues,
  });

  const handleSubmit = async (data: NoticeFormValues) => {
    try {
      setIsSubmitting(true);
      if (onSubmit) {
        await onSubmit(data);
      }
      form.reset();
      onOpenChange(false);
      toast.success('공지사항이 등록되었습니다');
    } catch (error) {
      console.error('Failed to create notice:', error);
      toast.error('공지사항 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>공지사항 작성</DialogTitle>
          <DialogDescription>
            새로운 공지사항을 작성합니다. 모든 필드를 채워주세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="공지사항 제목" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GENERAL">일반</SelectItem>
                      <SelectItem value="EVENT">이벤트</SelectItem>
                      <SelectItem value="UPDATE">업데이트</SelectItem>
                      <SelectItem value="IMPORTANT">중요</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>내용</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="공지사항 내용을 입력하세요"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPinned"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">상단 고정</FormLabel>
                    <FormDescription>
                      이 공지사항을 목록 상단에 고정합니다
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '등록 중...' : '등록하기'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
