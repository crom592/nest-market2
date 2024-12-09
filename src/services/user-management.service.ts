import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma';
import { UserRole, PenaltyType, VerificationStatus } from '@prisma/client';

@Injectable()
export class UserManagementService {
  constructor(private prisma: PrismaService) {}

  // Profile Completeness Calculation
  async calculateProfileCompleteness(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    let completeness = 0;
    if (user.name) completeness += 20;
    if (user.email) completeness += 20;
    if (user.phone) completeness += 20;
    if (user.image) completeness += 20;
    if (user.socialLinks) completeness += 20;

    await this.prisma.user.update({
      where: { id: userId },
      data: { profileCompleteness: completeness }
    });

    return completeness;
  }

  // Penalty Management
  async applyPenalty(
    userId: string, 
    penaltyType: PenaltyType, 
    reason: string
  ) {
    const severityMap = {
      [PenaltyType.NO_SHOW]: 50,
      [PenaltyType.LATE_PARTICIPATION]: 20,
      [PenaltyType.CANCELLATION]: 30,
      [PenaltyType.FRAUDULENT_ACTIVITY]: 100
    };

    const penalty = await this.prisma.userPenalty.create({
      data: {
        userId,
        penaltyType,
        severity: severityMap[penaltyType],
        reason,
        endAt: new Date(Date.now() + this.calculatePenaltyDuration(penaltyType))
      }
    });

    // Update user's penalty points
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        penaltyPoints: { increment: severityMap[penaltyType] },
        reputationScore: { decrement: severityMap[penaltyType] / 10 }
      }
    });

    return penalty;
  }

  // Calculate Penalty Duration
  private calculatePenaltyDuration(penaltyType: PenaltyType): number {
    switch (penaltyType) {
      case PenaltyType.NO_SHOW:
        return 48 * 60 * 60 * 1000; // 48 hours
      case PenaltyType.LATE_PARTICIPATION:
        return 24 * 60 * 60 * 1000; // 24 hours
      case PenaltyType.CANCELLATION:
        return 72 * 60 * 60 * 1000; // 72 hours
      case PenaltyType.FRAUDULENT_ACTIVITY:
        return 30 * 24 * 60 * 60 * 1000; // 30 days
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  // Document Verification
  async submitVerificationDocument(
    userId: string, 
    documentType: string, 
    documentUrl: string
  ) {
    return this.prisma.verificationDocument.create({
      data: {
        userId,
        documentType,
        documentUrl
      }
    });
  }

  // Check User Participation Eligibility
  async checkParticipationEligibility(
    userId: string, 
    groupPurchaseId: string
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        UserPenalty: { 
          where: { 
            isActive: true,
            endAt: { gt: new Date() }
          }
        }
      }
    });

    const groupPurchase = await this.prisma.groupPurchase.findUnique({
      where: { id: groupPurchaseId }
    });

    // Check penalty points
    if (user.penaltyPoints > (groupPurchase.maxPenaltyAllowed || 100)) {
      return false;
    }

    // Check active penalties
    if (user.UserPenalty.length > 0) {
      return false;
    }

    // Check reputation score
    if (user.reputationScore < (groupPurchase.minParticipationScore || 50)) {
      return false;
    }

    return true;
  }
}
