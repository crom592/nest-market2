// services/group-purchase.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma';
import { 
  GroupPurchaseStatus, 
  UserRole} from '@prisma/client';
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
  // 투표 로직 수정
  async conductVoting(groupPurchaseId: string) {
    const groupPurchase = await this.prisma.groupPurchase.findUnique({
      where: { id: groupPurchaseId },
      include: { participants: true, votes: true },
    });

    const totalParticipants = groupPurchase.participants.length;
    const yesVotes = groupPurchase.votes.filter((vote) => vote.vote).length;
    const noVotes = totalParticipants - yesVotes;

    const votingThreshold = this.calculateVotingThreshold(totalParticipants);

    const approvalRate = yesVotes / totalParticipants;

    if (approvalRate >= votingThreshold) {
      await this.prisma.groupPurchase.update({
        where: { id: groupPurchaseId },
        data: {
          status: GroupPurchaseStatus.CONFIRMED,
          participationHistory: this.updateParticipationHistory(
            groupPurchase.participationHistory,
            "system",
            "voting_completed_approved"
          ),
        },
      });
      return { approved: true, approvalRate };
    } else {
      await this.prisma.groupPurchase.update({
        where: { id: groupPurchaseId },
        data: {
          status: GroupPurchaseStatus.CANCELLED,
          participationHistory: this.updateParticipationHistory(
            groupPurchase.participationHistory,
            "system",
            "voting_completed_rejected"
          ),
        },
      });
      return { approved: false, approvalRate };
    }
  }

  // 페널티 로직 추가
  async applyPenalty(userId: string, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedPenaltyCount = user.penaltyCount + 1;

    let penaltyDuration;
    if (updatedPenaltyCount === 1) penaltyDuration = 48; // 48시간
    else if (updatedPenaltyCount === 2) penaltyDuration = 72; // 72시간
    else if (updatedPenaltyCount === 3) penaltyDuration = 168; // 1주일
    else penaltyDuration = 720; // 한 달

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        penaltyCount: updatedPenaltyCount,
        penaltyExpiresAt: new Date(Date.now() + penaltyDuration * 60 * 60 * 1000),
      },
    });

    // 로그 저장
    await this.prisma.penaltyLog.create({
      data: { userId, reason, penaltyDuration },
    });
  }

  // 등급 업데이트 메서드 추가
  async updateUserRank(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const purchaseCount = user.totalGroupPurchases;

    let newRank;
    if (purchaseCount <= 1) newRank = "초보참새";
    else if (purchaseCount <= 5) newRank = "우수한참새";
    else if (purchaseCount <= 10) newRank = "최우수참새";
    else if (purchaseCount <= 20) newRank = "우두머리참새";
    else newRank = "VIP참새";

    await this.prisma.user.update({
      where: { id: userId },
      data: { rank: newRank },
    });
  }

  // Calculate Dynamic Voting Threshold
  private calculateVotingThreshold(totalParticipants: number): number {
    if (totalParticipants <= 2) return 1.0;  // 100% approval needed
    if (totalParticipants <= 5) return 0.8;  // 80% approval
    return 0.6;  // 60% approval for larger groups
  }

  // Update Participation History
  private updateParticipationHistory(
    currentHistory: unknown, 
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

  // 필터링 및 검색 메서드 추가
  async findGroupPurchases(filters: {
    category?: ProductCategory;
    sortBy?: 'popularity' | 'remainingTime' | 'participantCount';
    page?: number;
    pageSize?: number;
  }) {
    const { 
      category, 
      sortBy = 'popularity', 
      page = 1, 
      pageSize = 10 
    } = filters;

    const orderBy = this.getOrderByClause(sortBy);

    const where: unknown = {};
    if (category) {
      where.category = category;
    }

    const groupPurchases = await this.prisma.groupPurchase.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });

    // 참여자 수 업데이트
    const updatedGroupPurchases = groupPurchases.map(gp => ({
      ...gp,
      participantCount: gp._count.participants
    }));

    return updatedGroupPurchases;
  }

  private getOrderByClause(sortBy: string) {
    switch (sortBy) {
      case 'popularity':
        return { popularity: 'desc' };
      case 'remainingTime':
        return { remainingTime: 'asc' };
      case 'participantCount':
        return { participantCount: 'desc' };
      default:
        return { popularity: 'desc' };
    }
  }

  // 인기도 자동 업데이트 메서드
  async updatePopularity(groupPurchaseId: string) {
    const groupPurchase = await this.prisma.groupPurchase.findUnique({
      where: { id: groupPurchaseId },
      include: {
        _count: {
          select: { 
            participants: true,
            bids: true
          }
        }
      }
    });

    if (!groupPurchase) {
      throw new Error('Group purchase not found');
    }

    // 인기도 계산 로직 (참여자 수, 입찰 수 등 고려)
    const popularity = this.calculatePopularity(
      groupPurchase._count.participants, 
      groupPurchase._count.bids
    );

    await this.prisma.groupPurchase.update({
      where: { id: groupPurchaseId },
      data: { 
        popularity,
        participantCount: groupPurchase._count.participants
      }
    });
  }

  private calculatePopularity(
    participantCount: number, 
    bidCount: number
  ): number {
    // 참여자 수와 입찰 수를 고려한 인기도 계산
    return (participantCount * 0.7) + (bidCount * 0.3);
  }
}
