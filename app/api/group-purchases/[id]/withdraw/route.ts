import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GroupPurchaseStatus } from '@prisma/client';

interface WithdrawInput {
  reason: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { reason } = (await request.json()) as WithdrawInput;

    if (!reason) {
      return NextResponse.json(
        { error: '취소 사유를 입력해주세요.' },
        { status: 400 }
      );
    }

    const groupPurchase = await prisma.groupPurchase.findUnique({
      where: { id: params.id },
      include: {
        participants: {
          where: {
            userId: session.user.id,
          },
        },
        bids: {
          where: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!groupPurchase) {
      return NextResponse.json(
        { error: '공구를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (groupPurchase.participants.length === 0) {
      return NextResponse.json(
        { error: '참여하지 않은 공구입니다.' },
        { status: 403 }
      );
    }

    if (groupPurchase.status !== GroupPurchaseStatus.ACTIVE && 
        groupPurchase.status !== GroupPurchaseStatus.BIDDING) {
      return NextResponse.json(
        { error: '진행중인 공구만 취소할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 참여 취소 처리
    await prisma.$transaction(async (tx) => {
      // 참여자 제거
      await tx.participant.delete({
        where: {
          userId_groupPurchaseId: {
            userId: session.user.id,
            groupPurchaseId: params.id,
          },
        },
      });

      // 입찰 내역 제거
      if (groupPurchase.bids.length > 0) {
        await tx.bid.deleteMany({
          where: {
            userId: session.user.id,
            groupPurchaseId: params.id,
          },
        });
      }

      // 취소 이력 생성
      await tx.withdrawalHistory.create({
        data: {
          userId: session.user.id,
          groupPurchaseId: params.id,
          reason,
        },
      });

      // 참여자 수가 0이 되면 공구 상태를 CANCELLED로 변경
      const remainingParticipants = await tx.participant.count({
        where: {
          groupPurchaseId: params.id,
        },
      });

      if (remainingParticipants === 0) {
        await tx.groupPurchase.update({
          where: { id: params.id },
          data: {
            status: GroupPurchaseStatus.CANCELLED,
          },
        });
      }
    });

    return NextResponse.json({ message: '공구 참여가 취소되었습니다.' });
  } catch (error) {
    console.error('Failed to withdraw from group purchase:', error);
    return NextResponse.json(
      { error: '공구 참여 취소에 실패했습니다.' },
      { status: 500 }
    );
  }
}
