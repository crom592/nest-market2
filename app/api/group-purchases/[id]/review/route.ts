import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GroupPurchaseStatus } from '@prisma/client';

interface ReviewInput {
  rating: number;
  content: string;
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

    const { rating, content } = (await request.json()) as ReviewInput;

    if (!rating || !content) {
      return NextResponse.json(
        { error: '평점과 리뷰 내용을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '평점은 1점에서 5점 사이여야 합니다.' },
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
        reviews: {
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
        { error: '참여하지 않은 공구는 리뷰를 작성할 수 없습니다.' },
        { status: 403 }
      );
    }

    if (groupPurchase.status !== GroupPurchaseStatus.COMPLETED) {
      return NextResponse.json(
        { error: '완료되지 않은 공구는 리뷰를 작성할 수 없습니다.' },
        { status: 400 }
      );
    }

    if (groupPurchase.reviews.length > 0) {
      return NextResponse.json(
        { error: '이미 리뷰를 작성했습니다.' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        rating,
        content,
        userId: session.user.id,
        groupPurchaseId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // 리뷰 작성 시 포인트 적립
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        points: {
          increment: 50,
        },
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json(
      { error: '리뷰 작성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          groupPurchaseId: params.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          groupPurchaseId: params.id,
        },
      }),
    ]);

    const response = {
      reviews,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json(
      { error: '리뷰 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
