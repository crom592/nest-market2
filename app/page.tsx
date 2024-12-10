// app/page.tsx
import Image from 'next/image'
import GroupPurchaseList from './components/GroupPurchaseList'
import CategoryNav from "./components/category-nav"

export default function Home() {
  return (
    <div>
      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8">
        <GroupPurchaseList />
      </main>
    </div>
  )
}