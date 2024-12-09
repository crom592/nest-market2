// src/app/api/group-purchases/[id]/bids/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupPurchase = await prisma.groupPurchase.findUnique({
      where: { id },
      select: {
        status: true,
        auctionStartTime: true,
        auctionEndTime: true,
        minPrice: true,
        maxPrice: true,
        currentParticipants: true,
        minParticipants: true,
      },
    });

    if (!groupPurchase) {
      return NextResponse.json(
        { error: '공구를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (groupPurchase.status !== 'BIDDING') {
      return NextResponse.json(
        { error: '현재 입찰이 불가능한 상태입니다.' },
        { status: 400 }
      );
    }

    const now = new Date();
    if (
      groupPurchase.auctionStartTime &&
      groupPurchase.auctionEndTime &&
      (now < groupPurchase.auctionStartTime || now > groupPurchase.auctionEndTime)
    ) {
      return NextResponse.json(
        { error: '입찰 기간이 아닙니다.' },
        { status: 400 }
      );
    }

    const bids = await prisma.bid.findMany({
      where: {
        groupPurchaseId: id,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            rating: true,
            bidCount: true,
          },
        },
      },
      orderBy: {
        price: 'asc',
      },
    });

    return NextResponse.json({ bids });
  } catch (error) {
    console.error('Failed to fetch bids:', error);
    return NextResponse.json(
      { error: '입찰 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [groupPurchase, user] = await Promise.all([
      prisma.groupPurchase.findUnique({
        where: { id },
        select: {
          status: true,
          auctionStartTime: true,
          auctionEndTime: true,
          minPrice: true,
          maxPrice: true,
          expectedPrice: true,
          _count: {
            select: {
              bids: true,
            },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          points: true,
          rating: true,
          bidCount: true,
          penaltyCount: true,
          penaltyEndTime: true,
        },
      }),
    ]);

    if (!groupPurchase) {
      return NextResponse.json(
        { error: '공구를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (groupPurchase.status !== 'BIDDING') {
      return NextResponse.json(
        { error: '현재 입찰이 불가능한 상태입니다.' },
        { status: 400 }
      );
    }

    const now = new Date();
    if (
      groupPurchase.auctionStartTime &&
      groupPurchase.auctionEndTime &&
      (now < groupPurchase.auctionStartTime || now > groupPurchase.auctionEndTime)
    ) {
      return NextResponse.json(
        { error: '입찰 기간이 아닙니다.' },
        { status: 400 }
      );
    }

    // Validate seller status
    if (user.role !== 'SELLER') {
      return NextResponse.json(
        { error: '판매자만 입찰할 수 있습니다.' },
        { status: 403 }
      );
    }

    if (!user.points || user.points < 100) {
      return NextResponse.json(
        { error: '입찰하기 위해서는 최소 100 포인트가 필요합니다.' },
        { status: 403 }
      );
    }

    // Check if seller is under penalty
    if (user.penaltyEndTime && user.penaltyEndTime > now) {
      return NextResponse.json(
        { error: '패널티 기간 동안은 입찰할 수 없습니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { price, description } = body;

    if (!price || !description) {
      return NextResponse.json(
        { error: '가격과 설명을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: '가격은 0보다 커야 합니다.' },
        { status: 400 }
      );
    }

    // Validate price against expected price
    if (groupPurchase.expectedPrice && price > groupPurchase.expectedPrice * 1.5) {
      return NextResponse.json(
        { error: '희망가의 1.5배를 초과하는 금액으로 입찰할 수 없습니다.' },
        { status: 400 }
      );
    }

    // Check if seller has already bid
    const existingBid = await prisma.bid.findFirst({
      where: {
        sellerId: session.user.id,
        groupPurchaseId: id,
      },
    });

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct points for bidding
      const pointsToDeduct = existingBid ? 5 : 10; // 새 입찰은 10점, 수정은 5점
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          points: { decrement: pointsToDeduct },
          bidCount: { increment: existingBid ? 0 : 1 },
        },
      });

      if (existingBid) {
        // Update existing bid
        const updatedBid = await tx.bid.update({
          where: { id: existingBid.id },
          data: {
            price,
            description,
            status: 'PENDING',
            updatedAt: new Date(),
          },
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                rating: true,
                bidCount: true,
                points: true,
              },
            },
          },
        });

        return {
          bid: updatedBid,
          isNew: false,
          remainingPoints: updatedUser.points,
        };
      }

      // Create new bid
      const newBid = await tx.bid.create({
        data: {
          price,
          description,
          sellerId: session.user.id,
          groupPurchaseId: id,
          status: 'PENDING',
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              rating: true,
              bidCount: true,
              points: true,
            },
          },
        },
      });

      return {
        bid: newBid,
        isNew: true,
        remainingPoints: updatedUser.points,
      };
    });

    return NextResponse.json(
      {
        bid: result.bid,
        remainingPoints: result.remainingPoints,
        message: result.isNew
          ? '입찰이 등록되었습니다.'
          : '입찰이 수정되었습니다.',
        pointsDeducted: result.isNew ? 10 : 5,
      },
      { status: result.isNew ? 201 : 200 }
    );
  } catch (error) {
    console.error('Failed to create bid:', error);
    return NextResponse.json(
      { error: '입찰에 실패했습니다.' },
      { status: 500 }
    );
  }
}