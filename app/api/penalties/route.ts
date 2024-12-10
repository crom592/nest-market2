import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const penaltySchema = z.object({
  userId: z.string(),
  type: z.enum(['NO_SHOW', 'LATE_PARTICIPATION', 'CANCELLATION', 'FRAUDULENT_ACTIVITY']),
  reason: z.string(),
  groupPurchaseId: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const data = penaltySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { penaltyCount: true, penaltyEndTime: true }
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Calculate penalty duration based on count
    let penaltyDuration: number;
    const newPenaltyCount = user.penaltyCount + 1;
    
    switch (newPenaltyCount) {
      case 1:
        penaltyDuration = 48; // 48 hours
        break;
      case 2:
        penaltyDuration = 72; // 72 hours
        break;
      case 3:
        penaltyDuration = 168; // 1 week
        break;
      default:
        penaltyDuration = 720; // 1 month (30 days)
    }

    const penaltyEndTime = new Date();
    penaltyEndTime.setHours(penaltyEndTime.getHours() + penaltyDuration);

    // Create penalty record and update user in a transaction
    const result = await prisma.$transaction([
      prisma.userPenalty.create({
        data: {
          userId: data.userId,
          type: data.type,
          reason: data.reason,
          duration: penaltyDuration,
          endTime: penaltyEndTime,
          ...(data.groupPurchaseId && {
            groupPurchase: { connect: { id: data.groupPurchaseId } }
          })
        }
      }),
      prisma.user.update({
        where: { id: data.userId },
        data: {
          penaltyCount: newPenaltyCount,
          penaltyEndTime: penaltyEndTime,
          penaltyPoints: { increment: 1 }
        }
      })
    ]);

    // Send notification to user
    await prisma.notification.create({
      data: {
        userId: data.userId,
        title: '패널티 부과 알림',
        content: `패널티가 부과되었습니다. 사유: ${data.reason}. 해제 시간: ${penaltyEndTime.toLocaleString()}`,
        type: 'PENALTY'
      }
    });

    return NextResponse.json({
      message: '패널티가 성공적으로 부과되었습니다.',
      penalty: result[0],
      updatedUser: result[1]
    });
  } catch (error) {
    console.error('Error in penalty handler:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '유효하지 않은 요청입니다.', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '패널티 부과 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Get user's penalties
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Only admin can view other users' penalties
    if (userId && userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const targetUserId = userId || session.user.id;

    const penalties = await prisma.userPenalty.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' },
      include: {
        groupPurchase: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json({ penalties });
  } catch (error) {
    console.error('Error in get penalties:', error);
    return NextResponse.json(
      { error: '패널티 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
