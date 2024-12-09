import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a consumer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        role: true,
        penaltyCount: true,
        penaltyEndTime: true,
        lastParticipation: true
      },
    });

    if (user?.role !== 'CONSUMER') {
      return NextResponse.json(
        { error: '소비자만 참여할 수 있습니다.' },
        { status: 403 }
      );
    }

    // Check if user is under penalty
    if (user.penaltyCount > 0 && user.penaltyEndTime && user.penaltyEndTime > new Date()) {
      return NextResponse.json(
        { 
          error: '패널티 기간 중입니다.',
          penaltyEndTime: user.penaltyEndTime
        },
        { status: 403 }
      );
    }

    const groupPurchase = await prisma.groupPurchase.findUnique({
      where: { id: params.id },
      include: {
        participants: true,
      },
    });

    if (!groupPurchase) {
      return NextResponse.json(
        { error: '공동구매를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (groupPurchase.status !== 'RECRUITING') {
      return NextResponse.json(
        { error: '현재 참여가 불가능한 상태입니다.' },
        { status: 400 }
      );
    }

    const isAlreadyParticipating = groupPurchase.participants.some(
      (participant) => participant.userId === session.user.id
    );

    if (isAlreadyParticipating) {
      return NextResponse.json(
        { error: '이미 참여 중인 공동구매입니다.' },
        { status: 400 }
      );
    }

    if (groupPurchase.participants.length >= groupPurchase.maxParticipants) {
      return NextResponse.json(
        { error: '최대 참여 인원을 초과했습니다.' },
        { status: 400 }
      );
    }

    // Create participant and update user's last participation time in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const participant = await tx.participant.create({
        data: {
          userId: session.user.id,
          groupPurchaseId: params.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      await tx.groupPurchase.update({
        where: { id: params.id },
        data: {
          currentParticipants: {
            increment: 1,
          },
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          lastParticipation: new Date(),
        },
      });

      return participant;
    });

    // Check if minimum participants reached
    if (groupPurchase.currentParticipants + 1 >= groupPurchase.minParticipants) {
      await prisma.groupPurchase.update({
        where: { id: params.id },
        data: {
          status: 'BIDDING',
          auctionStartTime: new Date(),
          auctionEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      });
    }

    return NextResponse.json({ 
      participant: result,
      message: '공동구매에 참여했습니다.'
    });
  } catch (error) {
    console.error('Failed to participate:', error);
    return NextResponse.json(
      { error: '참여에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupPurchase = await prisma.groupPurchase.findUnique({
      where: { id: params.id },
      select: { 
        creatorId: true,
        status: true,
      },
    });

    if (!groupPurchase) {
      return NextResponse.json(
        { error: '공동구매를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Creator cannot leave the group purchase
    if (groupPurchase.creatorId === session.user.id) {
      return NextResponse.json(
        { error: '공동구매 생성자는 참여를 취소할 수 없습니다.' },
        { status: 400 }
      );
    }

    // Can only leave during RECRUITING phase
    if (groupPurchase.status !== 'RECRUITING') {
      return NextResponse.json(
        { error: '모집 단계에서만 참여를 취소할 수 있습니다.' },
        { status: 400 }
      );
    }

    // Delete participation and update participant count in a transaction
    await prisma.$transaction([
      prisma.participant.delete({
        where: {
          userId_groupPurchaseId: {
            userId: session.user.id,
            groupPurchaseId: params.id,
          },
        },
      }),
      prisma.groupPurchase.update({
        where: { id: params.id },
        data: {
          currentParticipants: {
            decrement: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({ 
      success: true,
      message: '공동구매 참여를 취소했습니다.'
    });
  } catch (error) {
    console.error('Failed to leave group purchase:', error);
    return NextResponse.json(
      { error: '공동구매 참여 취소에 실패했습니다.' },
      { status: 500 }
    );
  }
}
