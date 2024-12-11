'use client';

import Link from 'next/link';
import { FaGithub, FaInstagram } from 'react-icons/fa';
import { SiNaver } from 'react-icons/si';
import { RiKakaoTalkFill } from 'react-icons/ri';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#8046F1] text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Nest Market</h3>
            <p className="text-sm">
              함께하는 즐거움, 공동구매의 새로운 경험
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/crom592/nest-market"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="#"
                className="text-white/60 hover:text-white transition-colors"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="#"
                className="text-white/60 hover:text-white transition-colors"
              >
                <SiNaver size={24} />
              </a>
              <a
                href="#"
                className="text-white/60 hover:text-white transition-colors"
              >
                <RiKakaoTalkFill size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">바로가기</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-white/60 hover:text-white transition-colors">
                  서비스 소개
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-white/60 hover:text-white transition-colors">
                  진행중인 공구
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-white/60 hover:text-white transition-colors">
                  이용방법
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/60 hover:text-white transition-colors">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">법적 고지</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/60 hover:text-white transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-white/60 hover:text-white transition-colors">
                  환불정책
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">고객센터</h3>
            <ul className="space-y-2">
              <li className="text-white/60">
                평일 10:00 - 18:00
              </li>
              <li className="text-white/60">
                점심시간 12:30 - 13:30
              </li>
              <li className="text-white/60">
                주말 및 공휴일 휴무
              </li>
              <li className="mt-4">
                <a
                  href="tel:1234-5678"
                  className="inline-block bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  1234-5678
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-white/60">
              © {currentYear} Nest Market. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                사업자정보확인
              </a>
              <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                전자금융거래이용약관
              </a>
              <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                통신판매업신고
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
