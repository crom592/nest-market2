'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'Configuration':
        return '서버 설정에 문제가 있습니다. 관리자에게 문의해주세요.';
      case 'AccessDenied':
        return '접근이 거부되었습니다. 권한이 없습니다.';
      case 'Verification':
        return '이메일 인증에 실패했습니다. 다시 시도해주세요.';
      case 'OAuthSignin':
        return '소셜 로그인 중 오류가 발생했습니다. 다시 시도해주세요.';
      case 'OAuthCallback':
        return '소셜 로그인 인증 중 오류가 발생했습니다.';
      case 'OAuthCreateAccount':
        return '소셜 계정 생성 중 오류가 발생했습니다.';
      case 'EmailCreateAccount':
        return '이메일 계정 생성 중 오류가 발생했습니다.';
      case 'Callback':
        return '인증 콜백 처리 중 오류가 발생했습니다.';
      case 'OAuthAccountNotLinked':
        return '이미 다른 소셜 계정으로 가입된 이메일입니다.';
      case 'EmailSignin':
        return '이메일 로그인 중 오류가 발생했습니다.';
      case 'CredentialsSignin':
        return '이메일 또는 비밀번호가 올바르지 않습니다.';
      default:
        return '인증 중 오류가 발생했습니다. 다시 시도해주세요.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            로그인 오류
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {getErrorMessage()}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-center">
            <Link
              href="/auth/signin"
              className="text-indigo-600 hover:text-indigo-500"
            >
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
