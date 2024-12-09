export interface GroupPurchase {
  id: string
  title: string
  description: string
  imageUrl: string
  targetPrice: number
  minParticipants?: number
  maxParticipants: number
  currentParticipants: number
  status: 'DRAFT' | 'RECRUITING' | 'BIDDING' | 'VOTING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  auctionStartTime?: string
  auctionEndTime?: string
  voteStartTime?: string
  voteEndTime?: string
}

