import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

export default function CreatePurchaseForm() {
  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">제목</label>
        <Input id="title" placeholder="공구 제목을 입력하세요" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">설명</label>
        <Textarea id="description" placeholder="공구에 대한 상세 설명을 입력하세요" />
      </div>
      <div>
        <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700">목표 가격</label>
        <Input id="targetPrice" type="number" placeholder="목표 가격을 입력하세요" />
      </div>
      <div>
        <label htmlFor="minParticipants" className="block text-sm font-medium text-gray-700">최소 참여자 수</label>
        <Input id="minParticipants" type="number" placeholder="최소 참여자 수를 입력하세요" />
      </div>
      <div>
        <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">최대 참여자 수</label>
        <Input id="maxParticipants" type="number" placeholder="최대 참여자 수를 입력하세요" />
      </div>
      <div>
        <label htmlFor="auctionEndTime" className="block text-sm font-medium text-gray-700">입찰 마감 시간</label>
        <Input id="auctionEndTime" type="datetime-local" />
      </div>
      <Button type="submit" className="w-full">공구 등록하기</Button>
    </form>
  )
}

