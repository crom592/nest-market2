import Image from "next/image"
import { Star, Users, Clock, Heart, Share2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function ProductGrid() {
  const products = [
    {
      id: 1,
      title: "갤럭시24 SK 번호이동 2년약정 75요금제 공구하실분",
      image: "https://picsum.photos/400/400?random=1",
      price: 800000,
      supportAmount: 200000,
      participants: 12,
      maxParticipants: 20,
      remainingTime: "1일 2시간 30분",
      status: "입찰 진행중",
      rating: 5,
    },
    {
      id: 2,
      title: "KT로 인터넷 갈아타기 공구 하실분~",
      image: "https://picsum.photos/400/400?random=2",
      price: 30000,
      supportAmount: 10000,
      participants: 5,
      maxParticipants: 10,
      remainingTime: "2일 5시간",
      status: "공구 모집중",
      rating: 4,
    },
    {
      id: 3,
      title: "LG전자 울트라기어 27GP750 500만원에 공구하실분 모이세요~",
      image: "https://picsum.photos/400/400?random=3",
      price: 5000000,
      supportAmount: 500000,
      participants: 3,
      maxParticipants: 5,
      remainingTime: "12시간",
      status: "투표 진행중",
      rating: 5,
    },
    {
      id: 4,
      title: "삼성전자 비스포크 그랑데 AI 컬렉터 Top-Fit WF2620HCVVD 본 공구하실분~",
      image: "https://picsum.photos/400/400?random=4",
      price: 1200000,
      supportAmount: 300000,
      participants: 8,
      maxParticipants: 15,
      remainingTime: "3일",
      status: "확정 대기중",
      rating: 4,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="aspect-square relative">
            <Image
              src={product.image}
              alt={product.title}
              className="object-cover"
              fill
            />
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/50">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-sm line-clamp-2 mb-2">
              {product.title}
            </h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-bold">{product.price.toLocaleString()}원</span>
              <Badge variant="secondary" className="text-xs">
                지원금 {product.supportAmount.toLocaleString()}원
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{product.participants}/{product.maxParticipants}명</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{product.remainingTime}</span>
              </div>
            </div>
            <Progress value={(product.participants / product.maxParticipants) * 100} className="mb-2" />
            <div className="flex items-center justify-between">
              <Badge
                variant={
                  product.status === "입찰 진행중"
                    ? "destructive"
                    : product.status === "공구 모집중"
                    ? "default"
                    : "secondary"
                }
              >
                {product.status}
              </Badge>
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm">{product.rating}</span>
              </div>
            </div>
            <div className="mt-2 flex justify-between">
              <Button size="sm" className="flex-1 mr-2">
                참여하기
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

