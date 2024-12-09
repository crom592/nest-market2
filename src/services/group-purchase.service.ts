import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma';
import { 
  GroupPurchaseStatus, 
  UserRole, 
  PurchaseStatus 
} from '@prisma/client';
import { UserManagementService } from './user-management.service';

@Injectable()
export class GroupPurchaseService {
  constructor(
    private prisma: PrismaService,
    private userManagementService: UserManagementService
  ) {}

  // Advanced Group Purchase Creation
  async createGroupPurchase(
    creatorId: string,
    data: {
      title: string;
      description: string;
      targetPrice: number;
      minParticipants: number;
      maxParticipants: number;
      auctionStartTime: Date;
      auctionEndTime: Date;
      minParticipationScore?: number;
      maxPenaltyAllowed?: number;
    }
  ) {
    // Validate creator's role and reputation
    const creator = await this.prisma.user.findUnique({
      where: { id: creatorId }
    });

    if (creator.role !== UserRole.SELLER && creator.role !== UserRole.ADMIN) {
      throw new BadRequestException('Only sellers can create group purchases');
    }

    // Create group purchase with advanced configuration
    const groupPurchase = await this.prisma.groupPurchase.create({
      data: {
        ...data,
        creatorId,
        status: GroupPurchaseStatus.DRAFT,
        currentParticipants: 0,
        minParticipationScore: data.minParticipationScore || 50,
        maxPenaltyAllowed: data.maxPenaltyAllowed || 100,
        auctionRules: JSON.stringify({
          anonymousBidding: false,
          priceReductionAllowed: false
        }),
        participationHistory: JSON.stringify([{
          userId: creatorId,
          action: 'created',
          timestamp: new Date()
        }])
      }
    });

    return groupPurchase;
  }

  // Participant Joining Logic
  async joinGroupPurchase(
    userId: string, 
    groupPurchaseId: string
  ) {
    // Check participation eligibility
    const isEligible = await this.userManagementService.checkParticipationEligibility(
      userId, 
      groupPurchaseId
    );

    if (!isEligible) {
      throw new BadRequestException('Not eligible to join this group purchase');
    }

    const groupPurchase = await this.prisma.groupPurchase.findUnique({
      where: { id: groupPurchaseId }
    });

    // Check participant limits
    if (groupPurchase.currentParticipants >= groupPurchase.maxParticipants) {
      throw new BadRequestException('Group purchase is full');
    }

    // Create participant entry
    const participant = await this.prisma.participant.create({
      data: {
        userId,
        groupPurchaseId
      }
    });

    // Update group purchase participant count
    await this.prisma.groupPurchase.update({
      where: { id: groupPurchaseId },
      data: {
        currentParticipants: { increment: 1 },
        participationHistory: this.updateParticipationHistory(
          groupPurchase.participationHistory, 
          userId, 
          'joined'
        )
      }
    });

    // Update user's participation stats
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        totalGroupPurchases: { increment: 1 }
      }
    });

    return participant;
  }

  // Advanced Voting System
  async conductVoting(groupPurchaseId: string) {
    const groupPurchase = await this.prisma.groupPurchase.findUnique({
      where: { id: groupPurchaseId },
      include: { 
        participants: true,
        votes: true 
      }
    });

    // Calculate voting results
    const totalParticipants = groupPurchase.participants.length;
    const votes = groupPurchase.votes;

    const yesVotes = votes.filter(vote => vote.vote).length;
    const noVotes = votes.filter(vote => !vote.vote).length;

    // Determine voting threshold
    const votingThreshold = groupPurchase.votingThresholdOverride 
      ? 0.5 
      : this.calculateVotingThreshold(totalParticipants);

    const approvalRate = yesVotes / totalParticipants;

    // Update group purchase status based on voting
    if (approvalRate >= votingThreshold) {
      await this.prisma.groupPurchase.update({
        where: { id: groupPurchaseId },
        data: { 
          status: GroupPurchaseStatus.CONFIRMED,
          participationHistory: this.updateParticipationHistory(
            groupPurchase.participationHistory, 
            'system', 
            'voting_completed_approved'
          )
        }
      });
      return { approved: true, approvalRate };
    } else {
      await this.prisma.groupPurchase.update({
        where: { id: groupPurchaseId },
        data: { 
          status: GroupPurchaseStatus.CANCELLED,
          participationHistory: this.updateParticipationHistory(
            groupPurchase.participationHistory, 
            'system', 
            'voting_completed_rejected'
          )
        }
      });
      return { approved: false, approvalRate };
    }
  }

  // Calculate Dynamic Voting Threshold
  private calculateVotingThreshold(totalParticipants: number): number {
    if (totalParticipants <= 2) return 1.0;  // 100% approval needed
    if (totalParticipants <= 5) return 0.8;  // 80% approval
    return 0.6;  // 60% approval for larger groups
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
}
