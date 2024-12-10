import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserLevel, UserRole } from '@prisma/client';

// Helper function to determine user level based on participation count
function determineUserLevel(role: UserRole, count: number): UserLevel {
  if (role === 'CONSUMER') {
    if (count <= 1) return 'BEGINNER_SPARROW';
    if (count <= 5) return 'GOOD_SPARROW';
    if (count <= 10) return 'BEST_SPARROW';
    if (count <= 20) return 'LEADER_SPARROW';
    return 'VIP_SPARROW';
  } else if (role === 'SELLER') {
    if (count <= 1) return 'BEGINNER_MOTHER_BIRD';
    if (count <= 5) return 'GOOD_MOTHER_BIRD';
    if (count <= 10) return 'BEST_MOTHER_BIRD';
    if (count <= 20) return 'LEADER_MOTHER_BIRD';
    return 'VIP_MOTHER_BIRD';
  }
  return 'BEGINNER_SPARROW'; // Default level
}

// Update user level
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        participationCount: true,
        totalGroupPurchases: true,
        successfulPurchases: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Calculate relevant count based on user role
    const count = user.role === 'CONSUMER' 
      ? user.participationCount 
      : user.successfulPurchases;

    const newLevel = determineUserLevel(user.role, count);

    // Update user level
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { level: newLevel },
      select: {
        id: true,
        level: true,
        role: true,
        participationCount: true,
        successfulPurchases: true
      }
    });

    // If level has changed, create a notification
    if (updatedUser.level !== user.level) {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          title: '등급 업데이트 알림',
          content: `축하합니다! 회원님의 등급이 ${updatedUser.level}로 상승했습니다!`,
          type: 'LEVEL_UP'
        }
      });
    }

    return NextResponse.json({
      message: '등급이 성공적으로 업데이트되었습니다.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in level update:', error);
    return NextResponse.json(
      { error: '등급 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Get user level information
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        level: true,
        role: true,
        participationCount: true,
        successfulPurchases: true,
        totalGroupPurchases: true,
        rating: true,
        reputationScore: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Calculate progress to next level
    const currentCount = user.role === 'CONSUMER' 
      ? user.participationCount 
      : user.successfulPurchases;

    let nextLevelThreshold: number;
    if (currentCount <= 1) nextLevelThreshold = 2;
    else if (currentCount <= 5) nextLevelThreshold = 6;
    else if (currentCount <= 10) nextLevelThreshold = 11;
    else if (currentCount <= 20) nextLevelThreshold = 21;
    else nextLevelThreshold = currentCount;

    const progress = Math.min((currentCount / nextLevelThreshold) * 100, 100);

    return NextResponse.json({
      user,
      levelProgress: {
        current: currentCount,
        nextThreshold: nextLevelThreshold,
        progressPercentage: progress
      }
    });
  } catch (error) {
    console.error('Error in get level info:', error);
    return NextResponse.json(
      { error: '등급 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
