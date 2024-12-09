import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const groupPurchase = await prisma.groupPurchase.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bids: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            price: 'asc',
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        votes: true,
      },
    });

    if (!groupPurchase) {
      return NextResponse.json({ error: '공구를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 현재 사용자의 참여 여부 확인
    const isParticipant = session?.user
      ? await prisma.participation.findUnique({
          where: {
            userId_groupPurchaseId: {
              userId: session.user.id,
              groupPurchaseId: params.id,
            },
          },
        })
      : null;

    // 현재 사용자의 투표 여부 확인
    const hasVoted = session?.user
      ? await prisma.vote.findUnique({
          where: {
            userId_groupPurchaseId: {
              userId: session.user.id,
              groupPurchaseId: params.id,
            },
          },
        })
      : null;

    return NextResponse.json({
      groupPurchase,
      isParticipant: !!isParticipant,
      hasVoted: !!hasVoted,
    });
  } catch (error) {
    console.error('Failed to fetch group purchase:', error);
    return NextResponse.json(
      { error: '공구 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupPurchase = await prisma.groupPurchase.findUnique({
      where: { id: params.id },
      select: { creatorId: true },
    });

    if (!groupPurchase) {
      return NextResponse.json({ error: '공구를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (groupPurchase.creatorId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await req.json();
    const updatedGroupPurchase = await prisma.groupPurchase.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ groupPurchase: updatedGroupPurchase });
  } catch (error) {
    console.error('Failed to update group purchase:', error);
    return NextResponse.json(
      { error: '공구 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupPurchase = await prisma.groupPurchase.findUnique({
      where: { id: params.id },
      select: { creatorId: true, status: true },
    });

    if (!groupPurchase) {
      return NextResponse.json({ error: '공구를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (groupPurchase.creatorId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    if (groupPurchase.status !== 'DRAFT' && groupPurchase.status !== 'RECRUITING') {
      return NextResponse.json(
        { error: '이미 진행 중인 공구는 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }

    await prisma.groupPurchase.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete group purchase:', error);
    return NextResponse.json(
      { error: '공구 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
