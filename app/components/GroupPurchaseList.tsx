import { GroupPurchase } from '../types'
import GroupPurchaseCard from './GroupPurchaseCard'

// This is a mock data. In a real application, you would fetch this data from your API.
const mockGroupPurchases: GroupPurchase[] = [
  {
    id: '1',
    title: '갤럭시 S24 공동구매',
    description: 'SK 번호이동 2년약정 75요금제',
    imageUrl: 'https://picsum.photos/200',
    targetPrice: 800000,
    currentParticipants: 15,
    maxParticipants: 20,
    status: 'RECRUITING',
    createdAt: new Date().toISOString(),
  },
  // ... add more mock data as needed
]

export default function GroupPurchaseList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockGroupPurchases.map((purchase) => (
        <GroupPurchaseCard key={purchase.id} purchase={purchase} />
      ))}
    </div>
  )
}

