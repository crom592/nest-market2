import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const reviewSchema = z.object({
  groupPurchaseId: z.string(),
  rating: z.number().min(1).max(5),
  content: z.string().min(1),
  kindnessScore: z.number().min(1).max(5).optional(),
  accuracyScore: z.number().min(1).max(5).optional(),
  deliveryScore: z.number().min(1).max(5).optional(),
  serviceScore: z.number().min(1).max(5).optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const data = reviewSchema.parse(body);

    // Check if the group purchase exists and is completed
    const groupPurchase = await prisma.groupPurchase.findUnique({
      where: { id: data.groupPurchaseId },
      include: {
        participants: {
          where: { userId: session.user.id }
        }
      }
    });

    if (!groupPurchase) {
      return NextResponse.json({ error: '공구를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (groupPurchase.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: '완료된 공구에 대해서만 리뷰를 작성할 수 있습니다.' },
        { status: 400 }
      );
    }

    if (!groupPurchase.participants.length) {
      return NextResponse.json(
        { error: '참여하지 않은 공구에는 리뷰를 작성할 수 없습니다.' },
        { status: 403 }
      );
    }

    // Check if user has already reviewed this purchase
    const existingReview = await prisma.review.findFirst({
      where: {
        groupPurchaseId: data.groupPurchaseId,
        userId: session.user.id
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: '이미 리뷰를 작성하셨습니다.' },
        { status: 400 }
      );
    }

    // Create review and update user ratings in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the review
      const review = await tx.review.create({
        data: {
          userId: session.user.id,
          groupPurchaseId: data.groupPurchaseId,
          rating: data.rating,
          content: data.content,
          kindnessScore: data.kindnessScore,
          accuracyScore: data.accuracyScore,
          deliveryScore: data.deliveryScore,
          serviceScore: data.serviceScore
        }
      });

      // Update seller's rating
      const allSellerReviews = await tx.review.findMany({
        where: {
          groupPurchase: {
            creatorId: groupPurchase.creatorId
          }
        },
        select: {
          rating: true,
          kindnessScore: true,
          accuracyScore: true,
          deliveryScore: true,
          serviceScore: true
        }
      });

      // Calculate average ratings
      const avgRating = allSellerReviews.reduce((sum, r) => sum + r.rating, 0) / allSellerReviews.length;
      
      // Update seller's rating
      await tx.user.update({
        where: { id: groupPurchase.creatorId },
        data: {
          rating: avgRating,
          reputationScore: {
            increment: data.rating >= 4 ? 5 : data.rating >= 3 ? 0 : -5
          }
        }
      });

      return review;
    });

    return NextResponse.json({
      message: '리뷰가 성공적으로 등록되었습니다.',
      review: result
    });
  } catch (error) {
    console.error('Error in review handler:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '유효하지 않은 요청입니다.', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '리뷰 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Get reviews for a group purchase or user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupPurchaseId = searchParams.get('groupPurchaseId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    if (!groupPurchaseId && !userId) {
      return NextResponse.json(
        { error: 'groupPurchaseId 또는 userId가 필요합니다.' },
        { status: 400 }
      );
    }

    const where = groupPurchaseId
      ? { groupPurchaseId }
      : { userId };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              level: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.review.count({ where })
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Error in get reviews:', error);
    return NextResponse.json(
      { error: '리뷰 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
