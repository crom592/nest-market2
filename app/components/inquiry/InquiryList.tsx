'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface Inquiry {
  id: string;
  title: string;
  content: string;
  status: 'PENDING' | 'ANSWERED';
  createdAt: string;
  answer?: {
    content: string;
    createdAt: string;
  };
}

// Mock data - Replace with actual API call
const mockInquiries: Inquiry[] = [
  {
    id: '1',
    title: '배송 관련 문의',
    content: '해외 배송도 가능한가요?',
    status: 'ANSWERED',
    createdAt: '2024-01-15T09:00:00Z',
    answer: {
      content: '현재 국내 배송만 지원하고 있습니다.',
      createdAt: '2024-01-15T10:30:00Z',
    },
  },
  {
    id: '2',
    title: '결제 방법 문의',
    content: '무통장 입금도 가능한가요?',
    status: 'PENDING',
    createdAt: '2024-01-16T14:00:00Z',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function InquiryList() {
  const [inquiries] = useState<Inquiry[]>(mockInquiries);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {inquiries.map((inquiry) => (
        <motion.div
          key={inquiry.id}
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <button
            onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
            className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {inquiry.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      inquiry.status === 'ANSWERED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {inquiry.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {format(new Date(inquiry.createdAt), 'yyyy년 MM월 dd일 HH:mm')}
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedId === inquiry.id ? 'transform rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {expandedId === inquiry.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200"
            >
              <div className="p-6">
                <div className="text-gray-800">
                  {inquiry.content}
                </div>
                {inquiry.answer && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-gray-800">
                          {inquiry.answer.content}
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {format(new Date(inquiry.answer.createdAt), 'yyyy년 MM월 dd일 HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
