import { Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function FilterBar() {
  return (
    <div className="flex items-center justify-between py-4">
      <Button variant="outline" size="sm" className="text-xs">
        <Filter className="mr-2 h-4 w-4" />
        필터
      </Button>
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm" className="text-xs">
          인기순
        </Button>
        <Button variant="ghost" size="sm" className="text-xs">
          남은 시간순
        </Button>
        <Button variant="ghost" size="sm" className="text-xs">
          참여 인원순
        </Button>
      </div>
    </div>
  )
}

