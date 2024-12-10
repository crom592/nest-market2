import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          함께하는 쇼핑의 즐거움
        </h1>
        <p className="mt-6 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto">
          둥지마켓에서 더 좋은 가격으로, 더 많은 혜택을 누리세요
        </p>
        <div className="mt-10 flex justify-center gap-x-6">
          <Link
            href="/group-purchases"
            className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            공동구매 참여하기
          </Link>
          <Link
            href="/about"
            className="rounded-md bg-white/10 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-white/20"
          >
            서비스 소개
          </Link>
        </div>
      </div>
    </div>
  );
}
