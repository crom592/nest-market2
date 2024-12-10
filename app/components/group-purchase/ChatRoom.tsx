'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: Date;
}

interface ChatRoomProps {
  groupPurchaseId: string;
}

export default function ChatRoom({ groupPurchaseId }: ChatRoomProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/group-purchases/${groupPurchaseId}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [groupPurchaseId]);

  useEffect(() => {
    if (groupPurchaseId) {
      fetchMessages();
    }
  }, [groupPurchaseId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/group-purchases/${groupPurchaseId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setMessages([...messages, data.message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg bg-white">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">채팅방</h2>
      </div>
      
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[70%] ${
                  message.senderId === session?.user?.id ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={`https://avatar.vercel.sh/${message.senderId}`} />
                  <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                </Avatar>
                
                <div>
                  {message.senderId !== session?.user?.id && (
                    <p className="text-sm text-gray-500 mb-1">{message.senderName}</p>
                  )}
                  <div
                    className={`rounded-lg p-3 ${
                      message.senderId === session?.user?.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !newMessage.trim()}>
            전송
          </Button>
        </div>
      </form>
    </div>
  );
}
