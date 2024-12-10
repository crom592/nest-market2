'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'Configuration':
        return '서버 설정에 문제가 있습니다. 관리자에게 문의해주세요.';
      case 'AccessDenied':
        return '접근이 거부되었습니다. 권한이 없습니다.';
      default:
        return '인증 중 오류가 발생했습니다. 다시 시도해주세요.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-3xl font-extrabold text-gray-900">로그인 오류</h2>
        <p className="mt-2 text-center text-sm text-gray-600">{getErrorMessage()}</p>
        <div className="mt-6">
          <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-500">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}