import Link from "next/link"

export default function MainNav() {
  return (
    <div className="border-b">
      <nav className="container flex justify-between px-4 overflow-x-auto">
        <Link
          href="#"
          className="border-b-2 border-primary px-4 py-3 text-sm font-medium text-primary whitespace-nowrap"
        >
          진행중인 공구
        </Link>
        <Link
          href="#"
          className="px-4 py-3 text-sm font-medium text-gray-600 whitespace-nowrap"
        >
          공구 등록하기
        </Link>
        <Link
          href="#"
          className="px-4 py-3 text-sm font-medium text-gray-600 whitespace-nowrap"
        >
          참여 중인 공구
        </Link>
        <Link
          href="#"
          className="px-4 py-3 text-sm font-medium text-gray-600 whitespace-nowrap"
        >
          완료된 공구
        </Link>
        <Link
          href="#"
          className="px-4 py-3 text-sm font-medium text-gray-600 whitespace-nowrap"
        >
          마이페이지
        </Link>
      </nav>
    </div>
  )
}

