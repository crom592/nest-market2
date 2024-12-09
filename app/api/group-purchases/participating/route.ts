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
          status: {
            in: [GroupPurchaseStatus.ACTIVE, GroupPurchaseStatus.BIDDING],
          },
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
            },
          },
          bids: {
            where: {
              userId: session.user.id,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            select: {
              price: true,
              rank: true,
            },
          },
        },
        orderBy: {
          endTime: 'asc',
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
          status: {
            in: [GroupPurchaseStatus.ACTIVE, GroupPurchaseStatus.BIDDING],
          },
        },
      }),
    ]);

    const response = {
      groupPurchases: groupPurchases.map((purchase) => ({
        ...purchase,
        currentBid: purchase.bids[0] || null,
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
    console.error('Failed to fetch participating group purchases:', error);
    return NextResponse.json(
      { error: '참여중인 공구 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
