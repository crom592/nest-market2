import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma';
import { BidStatus, GroupPurchaseStatus } from '@prisma/client';
import { UserManagementService } from './user-management.service';

@Injectable()
export class BiddingService {
  constructor(
    private prisma: PrismaService,
    private userManagementService: UserManagementService
  ) {}

  // Place a Bid with Advanced Validation
  async placeBid(
    userId: string, 
    groupPurchaseId: string, 
    bidPrice: number, 
    description: string
  ) {
    // Check participation eligibility
    const isEligible = await this.userManagementService.checkParticipationEligibility(
      userId, 
      groupPurchaseId
    );

    if (!isEligible) {
      throw new BadRequestException('Not eligible to place bid');
    }

    // Get user's reputation score
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    // Get group purchase details
    const groupPurchase = await this.prisma.groupPurchase.findUnique({
      where: { id: groupPurchaseId }
    });

    // Validate bid against group purchase rules
    if (groupPurchase.status !== GroupPurchaseStatus.BIDDING) {
      throw new BadRequestException('Bidding is not currently open');
    }

    // Create bid with advanced tracking
    const bid = await this.prisma.bid.create({
      data: {
        sellerId: userId,
        groupPurchaseId,
        price: bidPrice,
        description,
        status: BidStatus.PENDING,
        bidderReputationScore: user.reputationScore,
        competitivenessScore: this.calculateCompetitivenessScore(bidPrice, groupPurchase),
        isAnonymousBid: false,
        bidHistory: JSON.stringify([{
          price: bidPrice,
          timestamp: new Date(),
          userId
        }])
      }
    });

    // Update group purchase bid tracking
    await this.prisma.groupPurchase.update({
      where: { id: groupPurchaseId },
      data: {
        participationHistory: this.updateParticipationHistory(
          groupPurchase.participationHistory, 
          userId, 
          'bid'
        )
      }
    });

    return bid;
  }

  // Calculate Bid Competitiveness
  private calculateCompetitivenessScore(
    bidPrice: number, 
    groupPurchase: any
  ): number {
    // Complex scoring based on price, group purchase target, etc.
    const targetPrice = groupPurchase.targetPrice;
    const priceDeviation = Math.abs(bidPrice - targetPrice) / targetPrice;
    
    // Lower deviation means higher competitiveness
    return Math.max(0, 100 - (priceDeviation * 100));
  }

  // Update Participation History
  private updateParticipationHistory(
    currentHistory: any, 
    userId: string, 
    action: string
  ): string {
    const history = currentHistory ? JSON.parse(currentHistory) : [];
    
    history.push({
      userId,
      action,
      timestamp: new Date()
    });

    return JSON.stringify(history);
  }

  // Advanced Bid Selection Logic
  async selectWinningBid(groupPurchaseId: string) {
    const bids = await this.prisma.bid.findMany({
      where: { 
        groupPurchaseId,
        status: BidStatus.PENDING 
      },
      orderBy: [
        { competitivenessScore: 'desc' },
        { bidderReputationScore: 'desc' }
      ]
    });

    if (bids.length === 0) {
      throw new BadRequestException('No bids available');
    }

    // Select top bid
    const winningBid = bids[0];

    // Update bid and group purchase status
    await this.prisma.bid.update({
      where: { id: winningBid.id },
      data: { status: BidStatus.ACCEPTED }
    });

    await this.prisma.groupPurchase.update({
      where: { id: groupPurchaseId },
      data: { 
        status: GroupPurchaseStatus.CONFIRMED,
        participationHistory: this.updateParticipationHistory(
          winningBid.bidHistory, 
          winningBid.sellerId, 
          'bid_winner'
        )
      }
    });

    return winningBid;
  }
}
