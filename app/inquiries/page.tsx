import { Metadata } from 'next';
import InquiryList from '@/components/inquiry/InquiryList';
import CreateInquiryButton from '@/components/inquiry/CreateInquiryButton';

export const metadata: Metadata = {
  title: '문의하기 - Nest Market',
  description: 'Nest Market에 대한 문의사항을 등록하고 답변을 받아보세요.',
};

export default function InquiriesPage() {
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
