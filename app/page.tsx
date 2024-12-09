import Link from 'next/link'
import { Button } from './components/ui/button'
import GroupPurchaseList from './components/GroupPurchaseList'

export default function Home() {
  return (
    <div>
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">둥지마켓에 오신 것을 환영합니다</h1>
        <p className="text-xl mb-8">함께 모여 더 좋은 가격에 구매하세요</p>
        <Button asChild>
          <Link href="/group-purchases">공구 둘러보기</Link>
        </Button>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">진행 중인 공구</h2>
        <GroupPurchaseList />
      </section>
    </div>
  )
}

