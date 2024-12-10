import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 10,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      order: (searchParams.get('order') || 'desc') as 'asc' | 'desc',
    };

    // Build where clause
    const where: any = {};
    if (params.category) {
      where.category = params.category;
    }
    if (params.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (params.sortBy) {
      case 'popularity':
        orderBy = { popularity: params.order };
        break;
      case 'timeLeft':
        orderBy = { endTime: params.order };
        break;
      case 'participantCount':
        orderBy = { participantCount: params.order };
        break;
      case 'price':
        orderBy = { price: params.order };
        break;
      default:
        orderBy = { createdAt: params.order };
    }

    const groupPurchases = await prisma.groupPurchase.findMany({
      where,
      orderBy,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      include: {
        _count: {
          select: {
            participants: true,
            likes: true,
          },
        },
      },
    });

    return NextResponse.json(groupPurchases);
  } catch (error) {
    console.error('Error in group purchases filter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group purchases' },
      { status: 500 }
    );
  }
}