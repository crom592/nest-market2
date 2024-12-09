import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get statistics
    const [totalUsers, totalGroupPurchases, activeGroupPurchases, totalBids] = await Promise.all([
      prisma.user.count(),
      prisma.groupPurchase.count(),
      prisma.groupPurchase.count({
        where: {
          status: 'ACTIVE',
        },
      }),
      prisma.bid.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalGroupPurchases,
      activeGroupPurchases,
      totalBids,
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
