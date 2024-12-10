'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Bell, BellRing, X, Check, ShoppingBag, Users, Gift, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Notification {
  id: string;
  type: 'GROUP_PURCHASE' | 'PARTICIPANT' | 'POINT' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  link?: string;
}

const NOTIFICATION_ICONS = {
  GROUP_PURCHASE: ShoppingBag,
  PARTICIPANT: Users,
  POINT: Gift,
  SYSTEM: MessageSquare,
} as const;

const NOTIFICATION_COLORS = {
  GROUP_PURCHASE: 'text-blue-500',
  PARTICIPANT: 'text-green-500',
  POINT: 'text-yellow-500',
  SYSTEM: 'text-purple-500',
} as const;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // You can add more logic here if needed, such as fetching notifications
  // or updating read status

  return { 
    notifications, 
    setNotifications, 
    unreadCount, 
    setUnreadCount 
  };
}

export default function NotificationCenter() {
  const { data: session } = useSession();
  const { notifications, setNotifications, unreadCount, setUnreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  useEffect(() => {
    // WebSocket 연결 설정
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      handleNewNotification(notification);
    };

    return () => {
      ws.close();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('알림을 불러오는데 실패했습니다');
      const data = await response.json();
      setNotifications(data);
      updateUnreadCount(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    updateUnreadCount([notification, ...notifications]);
    
    // 브라우저 알림 표시
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/notification-icon.png'
      });
    }
  };

  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.isRead).length;
    setUnreadCount(count);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('알림 읽음 처리에 실패했습니다');
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      updateUnreadCount(notifications);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('알림 읽음 처리에 실패했습니다');
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('알림 삭제에 실패했습니다');
      
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
      updateUnreadCount(notifications);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedTab === 'all') return true;
    return notification.type === selectedTab;
  });

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setIsOpen(true)}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">알림</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8"
            >
              모두 읽음
            </Button>
          )}
        </div>
        <Tabs
          defaultValue="all"
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5 p-1">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="GROUP_PURCHASE">공구</TabsTrigger>
            <TabsTrigger value="PARTICIPANT">참여자</TabsTrigger>
            <TabsTrigger value="POINT">포인트</TabsTrigger>
            <TabsTrigger value="SYSTEM">시스템</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[300px]">
            <AnimatePresence initial={false}>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => {
                  const Icon = NOTIFICATION_ICONS[notification.type];
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`flex items-start gap-3 p-4 border-b hover:bg-gray-50 ${
                        !notification.isRead ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full ${
                          NOTIFICATION_COLORS[notification.type]
                        } bg-opacity-10`}
                      >
                        <Icon className={`h-4 w-4 ${NOTIFICATION_COLORS[notification.type]}`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-sm text-gray-500">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                  <Bell className="h-8 w-8 mb-2" />
                  <p>알림이 없습니다</p>
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
