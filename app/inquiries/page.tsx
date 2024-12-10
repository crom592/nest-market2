'use client';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Metadata } from 'next';
import InquiryList from '@/components/inquiry/InquiryList';
import CreateInquiryButton from '@/components/inquiry/CreateInquiryButton';

export const dynamic = 'force-dynamic';

export default async function InquiriesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              문의하기
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              궁금하신 점이나 도움이 필요하신 내용을 문의해주세요.
            </p>
          </div>
          <CreateInquiryButton />
        </div>
        <InquiryList />
      </div>
    </div>
  );
}
