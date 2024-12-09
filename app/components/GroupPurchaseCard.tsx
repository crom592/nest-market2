'use client'

import { useState } from 'react'
import { GroupPurchase } from '../types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Progress } from './ui/progress'

interface GroupPurchaseCardProps {
  purchase: GroupPurchase
}

export default function GroupPurchaseCard({ purchase }: GroupPurchaseCardProps) {
  const [isParticipating, setIsParticipating] = useState(false)

  const handleParticipate = () => {
    // TODO: Implement actual participation logic
    setIsParticipating(!isParticipating)
    console.log(`${isParticipating ? '참여 취소' : '참여'} in:`, purchase.id)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{purchase.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <img src={purchase.imageUrl} alt={purchase.title} className="w-full h-48 object-cover mb-4" />
        <p className="text-sm text-gray-600 mb-2">{purchase.description}</p>
        <p className="font-semibold mb-2">목표가: {purchase.targetPrice.toLocaleString()}원</p>
        <div className="mb-2">
          <Progress value={(purchase.currentParticipants / purchase.maxParticipants) * 100} />
        </div>
        <p className="text-sm text-gray-600">
          {purchase.currentParticipants}/{purchase.maxParticipants} 참여
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleParticipate}>
          {isParticipating ? '참여 취소' : '참여하기'}
        </Button>
      </CardFooter>
    </Card>
  )
}

