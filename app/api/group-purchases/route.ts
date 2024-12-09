import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GroupPurchaseStatus } from '@prisma/client';
import { z } from 'zod';

const createGroupPurchaseSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(100, '제목은 100자 이내로 입력해주세요.'),
  description: z.string().min(1, '설명을 입력해주세요.').max(2000, '설명은 2000자 이내로 입력해주세요.'),
  minParticipants: z.number()
    .int()
    .min(2, '최소 2명 이상이어야 합니다.')
    .max(100, '최대 100명까지 가능합니다.'),
  maxParticipants: z.number()
    .int()
    .min(2, '최소 2명 이상이어야 합니다.')
    .max(100, '최대 100명까지 가능합니다.'),
  expectedPrice: z.number()
    .min(1000, '1,000원 이상이어야 합니다.')
    .max(100000000, '1억원 이하여야 합니다.'),
  auctionStartTime: z.string().datetime(),
  auctionEndTime: z.string().datetime(),
});

type CreateGroupPurchaseInput = z.infer<typeof createGroupPurchaseSchema>;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = createGroupPurchaseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다.', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // Validate auction time range
    const startTime = new Date(data.auctionStartTime);
    const endTime = new Date(data.auctionEndTime);
    
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: '경매 종료 시간은 시작 시간보다 늦어야 합니다.' },
        { status: 400 }
      );
    }

    if (data.minParticipants >= data.maxParticipants) {
      return NextResponse.json(
        { error: '최대 참여자 수는 최소 참여자 수보다 커야 합니다.' },
        { status: 400 }
      );
    }

    // 한 계정당 두 개 공구 동시 진행 제한 확인
    const activeGroupPurchases = await prisma.groupPurchase.count({
      where: {
        creatorId: session.user.id,
        status: {
          in: ['RECRUITING', 'BIDDING', 'VOTING'],
        },
      },
    });

    if (activeGroupPurchases >= 2) {
      return NextResponse.json(
        { error: '한 계정당 최대 2개의 공구만 동시에 진행할 수 있습니다.' },
        { status: 400 }
      );
    }

    const groupPurchase = await prisma.groupPurchase.create({
      data: {
        title: data.title,
        description: data.description,
        minParticipants: data.minParticipants,
        maxParticipants: data.maxParticipants,
        expectedPrice: data.expectedPrice,
        auctionStartTime: data.auctionStartTime,
        auctionEndTime: data.auctionEndTime,
        status: 'RECRUITING',
        creatorId: session.user.id,
        currentParticipants: 1,
      },
      include: {
        creator: true,
      },
    });

    // 생성자를 자동으로 참여자로 등록
    await prisma.participation.create({
      data: {
        userId: session.user.id,
        groupPurchaseId: groupPurchase.id,
      },
    });

    // 채팅방 생성
    await prisma.chatRoom.create({
      data: {
        groupPurchaseId: groupPurchase.id,
      },
    });

    return NextResponse.json({ groupPurchase }, { status: 201 });
  } catch (error) {
    console.error('Failed to create group purchase:', error);
    return NextResponse.json(
      { error: '공구 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = status ? { status: status as GroupPurchaseStatus } : {};

    const [groupPurchases, total] = await Promise.all([
      prisma.groupPurchase.findMany({
        where,
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
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.groupPurchase.count({ where }),
    ]);

    // Serialize dates to ISO strings
    const serializedPurchases = groupPurchases.map(purchase => ({
      ...purchase,
      createdAt: purchase.createdAt.toISOString(),
      updatedAt: purchase.updatedAt.toISOString(),
      auctionStartTime: purchase.auctionStartTime?.toISOString() || null,
      auctionEndTime: purchase.auctionEndTime?.toISOString() || null,
      voteStartTime: purchase.voteStartTime?.toISOString() || null,
      voteEndTime: purchase.voteEndTime?.toISOString() || null,
    }));

    const response = {
      groupPurchases: serializedPurchases,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch group purchases:', error);
    return NextResponse.json({ error: '공구 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
