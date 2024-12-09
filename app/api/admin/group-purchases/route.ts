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

    // Get all group purchases with related data
    const purchases = await prisma.groupPurchase.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        creator: {
          select: {
            name: true,
          },
        },
        participants: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data
    const transformedPurchases = purchases.map(purchase => ({
      id: purchase.id,
      title: purchase.title,
      status: purchase.status,
      creatorName: purchase.creator.name || '알 수 없음',
      participantCount: purchase.participants.length,
      createdAt: purchase.createdAt,
    }));

    return NextResponse.json(transformedPurchases);
  } catch (error) {
    console.error('Failed to fetch group purchases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (admin?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { purchaseId, status } = await request.json();

    if (!purchaseId) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      );
    }

    // Update group purchase
    const updatedPurchase = await prisma.groupPurchase.update({
      where: { id: purchaseId },
      data: {
        status,
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        creator: {
          select: {
            name: true,
          },
        },
        participants: {
          select: {
            id: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedPurchase.id,
      title: updatedPurchase.title,
      status: updatedPurchase.status,
      creatorName: updatedPurchase.creator.name || '알 수 없음',
      participantCount: updatedPurchase.participants.length,
      createdAt: updatedPurchase.createdAt,
    });
  } catch (error) {
    console.error('Failed to update group purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
