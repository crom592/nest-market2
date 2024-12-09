import GroupPurchaseList from '../components/GroupPurchaseList'
import { Button } from '../components/ui/button'

export default function GroupPurchases() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">공구 목록</h1>
        <Button>필터</Button>
      </div>
      <GroupPurchaseList />
    </div>
  )
}

