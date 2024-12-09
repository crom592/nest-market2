import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">둥지마켓</h3>
            <p className="text-sm text-gray-600">함께 모여 더 좋은 가격에 구매하는 공동구매 플랫폼</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">빠른 링크</h3>
            <ul className="space-y-2">
              <li><Link href="/group-purchases" className="text-sm text-gray-600 hover:text-primary">공구 목록</Link></li>
              <li><Link href="/create-purchase" className="text-sm text-gray-600 hover:text-primary">공구 등록</Link></li>
              <li><Link href="/my-purchases" className="text-sm text-gray-600 hover:text-primary">내 공구</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">고객 지원</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-sm text-gray-600 hover:text-primary">자주 묻는 질문</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-600 hover:text-primary">문의하기</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-600 hover:text-primary">이용약관</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          © {new Date().getFullYear()} 둥지마켓. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

