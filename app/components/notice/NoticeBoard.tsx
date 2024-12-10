'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Pin, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'EVENT' | 'UPDATE' | 'IMPORTANT';
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NoticeBoardProps {
  notices: Notice[];
  isAdmin?: boolean;
}

const CATEGORY_MAP = {
  GENERAL: { label: '일반', color: 'default' },
  EVENT: { label: '이벤트', color: 'yellow' },
  UPDATE: { label: '업데이트', color: 'blue' },
  IMPORTANT: { label: '중요', color: 'red' },
} as const;

export default function NoticeBoard({ notices = [], isAdmin = false }: NoticeBoardProps) {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedNotices, setExpandedNotices] = useState<string[]>([]);

  const toggleNotice = (noticeId: string) => {
    setExpandedNotices(prev =>
      prev.includes(noticeId)
        ? prev.filter(id => id !== noticeId)
        : [...prev, noticeId]
    );
  };

  const filteredNotices = notices
    .filter(notice => selectedCategory === 'all' || notice.category === selectedCategory)
    .sort((a, b) => {
      // 핀고정된 공지를 먼저 정렬
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // 그 다음 최신순으로 정렬
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>공지사항</CardTitle>
        <CardDescription>
          중요한 공지사항과 업데이트 소식을 확인하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>
              전체
            </TabsTrigger>
            {Object.entries(CATEGORY_MAP).map(([key, { label }]) => (
              <TabsTrigger
                key={key}
                value={key}
                onClick={() => setSelectedCategory(key)}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Accordion type="multiple" value={expandedNotices}>
              {filteredNotices.map((notice) => (
                <AccordionItem
                  key={notice.id}
                  value={notice.id}
                  className={`${
                    notice.isPinned ? 'bg-gray-50' : ''
                  } border rounded-lg mb-2`}
                >
                  <AccordionTrigger
                    onClick={() => toggleNotice(notice.id)}
                    className="px-4 py-2 hover:no-underline"
                  >
                    <div className="flex items-center gap-2 flex-1 text-left">
                      {notice.isPinned && (
                        <Pin className="h-4 w-4 text-red-500" />
                      )}
                      <Badge
                        variant={
                          notice.category === 'IMPORTANT'
                            ? 'destructive'
                            : notice.category === 'EVENT'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {CATEGORY_MAP[notice.category].label}
                      </Badge>
                      <span className="flex-1">{notice.title}</span>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(notice.createdAt), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-2">
                    <div className="prose max-w-none">
                      <div
                        dangerouslySetInnerHTML={{ __html: notice.content }}
                        className="whitespace-pre-wrap"
                      />
                    </div>
                    {isAdmin && (
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          수정
                        </Button>
                        <Button variant="destructive" size="sm">
                          삭제
                        </Button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          {Object.keys(CATEGORY_MAP).map((category) => (
            <TabsContent key={category} value={category} className="mt-4">
              <Accordion type="multiple" value={expandedNotices}>
                {filteredNotices.map((notice) => (
                  <AccordionItem
                    key={notice.id}
                    value={notice.id}
                    className={`${
                      notice.isPinned ? 'bg-gray-50' : ''
                    } border rounded-lg mb-2`}
                  >
                    <AccordionTrigger
                      onClick={() => toggleNotice(notice.id)}
                      className="px-4 py-2 hover:no-underline"
                    >
                      <div className="flex items-center gap-2 flex-1 text-left">
                        {notice.isPinned && (
                          <Pin className="h-4 w-4 text-red-500" />
                        )}
                        <span className="flex-1">{notice.title}</span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(notice.createdAt), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-2">
                      <div className="prose max-w-none">
                        <div
                          dangerouslySetInnerHTML={{ __html: notice.content }}
                          className="whitespace-pre-wrap"
                        />
                      </div>
                      {isAdmin && (
                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            수정
                          </Button>
                          <Button variant="destructive" size="sm">
                            삭제
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>

        {isAdmin && (
          <div className="mt-4 flex justify-end">
            <Button>공지사항 작성</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
