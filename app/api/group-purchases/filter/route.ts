// src/app/api/group-purchases/filter/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ProductCategory } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// 필터링 스키마 정의
const filterSchema = z.object({
  category: z.nativeEnum(ProductCategory).optional(),
  sortBy: z.enum(['popularity', 'remainingTime', 'participantCount']).default('popularity'),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10)
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params = filterSchema.parse({
      category: searchParams.get('category') as ProductCategory | undefined,
      sortBy: searchParams.get('sortBy') || 'popularity',
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '10', 10),
    });

    const groupPurchases = await prisma.groupPurchase.findMany({
      where: params.category ? { category: params.category } : {},
      orderBy: {
        popularity: params.sortBy === 'popularity' ? 'desc' : undefined,
        remainingTime: params.sortBy === 'remainingTime' ? 'asc' : undefined,
        participantCount: params.sortBy === 'participantCount' ? 'desc' : undefined,
      },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    });

    return NextResponse.json({ data: groupPurchases });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '필터링 중 오류 발생' }, { status: 500 });
  }
}