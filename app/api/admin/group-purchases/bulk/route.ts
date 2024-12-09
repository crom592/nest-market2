import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type ExcelPurchase = {
  title: string;
  description: string;
  targetPrice: string | number;
  minParticipants: string | number;
  maxParticipants: string | number;
  category: string;
};

export async function POST(request: Request) {
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

    const { purchases } = await request.json();

    if (!Array.isArray(purchases)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Validate and transform the data
    const validPurchases = purchases.map((purchase: ExcelPurchase) => ({
      title: String(purchase.title),
      description: String(purchase.description),
      targetPrice: Number(purchase.targetPrice),
      minParticipants: Number(purchase.minParticipants),
      maxParticipants: Number(purchase.maxParticipants),
      category: String(purchase.category),
      status: 'DRAFT',
      creatorId: session.user.id,
    }));

    // Validate required fields and data types
    const invalidPurchases = validPurchases.filter(
      purchase =>
        !purchase.title ||
        !purchase.description ||
        isNaN(purchase.targetPrice) ||
        isNaN(purchase.minParticipants) ||
        isNaN(purchase.maxParticipants) ||
        !purchase.category ||
        purchase.targetPrice <= 0 ||
        purchase.minParticipants <= 0 ||
        purchase.maxParticipants <= 0 ||
        purchase.minParticipants > purchase.maxParticipants
    );

    if (invalidPurchases.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid data in Excel file',
          invalidRows: invalidPurchases,
        },
        { status: 400 }
      );
    }

    // Create all group purchases in a transaction
    const createdPurchases = await prisma.$transaction(
      validPurchases.map(purchase =>
        prisma.groupPurchase.create({
          data: purchase,
          select: {
            id: true,
            title: true,
            status: true,
          },
        })
      )
    );

    return NextResponse.json({
      message: 'Successfully created group purchases',
      purchases: createdPurchases,
    });
  } catch (error) {
    console.error('Failed to create group purchases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
