export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ProductCategory } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// 필터링 스키마 정의
const filterSchema = z.object({
  category: z.nativeEnum(ProductCategory).nullable().optional(),
  sortBy: z.enum(['popularity', 'remainingTime', 'participantCount']).default('popularity'),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10)
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 필터 스키마 파싱 및 기본값 설정
    const params = filterSchema.parse({
      category: searchParams.get('category') as ProductCategory | null,
      sortBy: searchParams.get('sortBy') || 'popularity',
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '10', 10),
    });

    // Prisma에서 조건에 따라 데이터 가져오기
    const where = {
      ...(params.category && { category: params.category }),
    };

    const orderBy = (() => {
      switch (params.sortBy) {
        case 'popularity':
          return { popularity: params.order };
        case 'remainingTime':
          return { endTime: params.order }; // Prisma 필드에 맞게 수정
        case 'participantCount':
          return { participantCount: params.order };
        case 'price':
          return { price: params.order };
        default:
          return { popularity: 'desc' }; // 기본 정렬 기준
      }
    })();

    const [groupPurchases, total] = await Promise.all([
      prisma.groupPurchase.findMany({
        where,
        orderBy, // Corrected
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize, // Corrected
      }),
    ]);

    return NextResponse.json({ data: groupPurchases });
  } catch (error) {
    console.error('Error during filtering:', error);

    // ZodError 처리
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '유효하지 않은 요청입니다.', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: '필터링 중 서버 오류 발생' }, { status: 500 });
  }
}