import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GroupPurchaseStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [groupPurchases, total] = await Promise.all([
      prisma.groupPurchase.findMany({
        where: {
          participants: {
            some: {
              userId: session.user.id,
            },
          },
          status: GroupPurchaseStatus.COMPLETED,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              participants: true,
              bids: true,
              votes: true,
              reviews: true,
            },
          },
          reviews: {
            where: {
              userId: session.user.id,
            },
            select: {
              rating: true,
              content: true,
            },
            take: 1,
          },
        },
        orderBy: {
          endTime: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.groupPurchase.count({
        where: {
          participants: {
            some: {
              userId: session.user.id,
            },
          },
          status: GroupPurchaseStatus.COMPLETED,
        },
      }),
    ]);

    const response = {
      groupPurchases: groupPurchases.map((purchase) => ({
        ...purchase,
        review: purchase.reviews[0] || null,
      })),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch completed group purchases:', error);
    return NextResponse.json(
      { error: '완료된 공구 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { purchaseId } = await request.json();

    const groupPurchase = await prisma.groupPurchase.findUnique({
      where: { id: purchaseId },
      include: {
        participants: {
          where: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!groupPurchase) {
      return NextResponse.json({ error: '공구를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (groupPurchase.participants.length === 0) {
      return NextResponse.json(
        { error: '참여하지 않은 공구입니다.' },
        { status: 403 }
      );
    }

    if (groupPurchase.status !== GroupPurchaseStatus.COMPLETED) {
      return NextResponse.json(
        { error: '아직 완료되지 않은 공구입니다.' },
        { status: 400 }
      );
    }

    const updatedGroupPurchase = await prisma.groupPurchase.update({
      where: { id: purchaseId },
      data: {
        status: GroupPurchaseStatus.COMPLETED,
      },
    });

    return NextResponse.json(updatedGroupPurchase);
  } catch (error) {
    console.error('Failed to complete group purchase:', error);
    return NextResponse.json(
      { error: '공구 완료 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}
