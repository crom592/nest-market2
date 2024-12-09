import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get active group purchases
    const activeGroupPurchases = await prisma.groupPurchaseParticipant.count({
      where: {
        userId,
        groupPurchase: {
          status: {
            in: ['RECRUITING', 'VOTING', 'CONFIRMED'],
          },
        },
      },
    });

    // Get total purchases
    const totalPurchases = await prisma.groupPurchaseParticipant.count({
      where: {
        userId,
        groupPurchase: {
          status: 'COMPLETED',
        },
      },
    });

    // Get average rating from reviews
    const reviews = await prisma.review.findMany({
      where: {
        userId,
      },
      select: {
        rating: true,
      },
    });

    const rating = reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : null;

    // Get participation count (including all statuses)
    const participationCount = await prisma.groupPurchaseParticipant.count({
      where: {
        userId,
      },
    });

    return NextResponse.json({
      activeGroupPurchases,
      totalPurchases,
      rating,
      participationCount,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
