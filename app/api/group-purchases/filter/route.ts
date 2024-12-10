// src/app/api/group-purchases/filter/route.ts
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
    // URL 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const rawCategory = searchParams.get('category');
    const rawSortBy = searchParams.get('sortBy');

    const params = {
      category: rawCategory === null ? undefined : rawCategory as ProductCategory | undefined,
      sortBy: rawSortBy === null ? undefined : rawSortBy as 'popularity' | 'remainingTime' | 'participantCount' | undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '10', 10)
    };

    // 스키마 유효성 검사
    const validatedParams = filterSchema.parse(params);

    // 그룹 구매 필터링
    const groupPurchases = await prisma.groupPurchase.findMany({
      where: validatedParams.category 
        ? { category: validatedParams.category } 
        : {},
      orderBy: 
        validatedParams.sortBy === 'popularity' ? { popularity: 'desc' } :
        validatedParams.sortBy === 'remainingTime' ? { remainingTime: 'asc' } :
        { participantCount: 'desc' },
      skip: (validatedParams.page - 1) * validatedParams.pageSize,
      take: validatedParams.pageSize,
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });

    // 참여자 수 추가
    const formattedGroupPurchases = groupPurchases.map(gp => ({
      ...gp,
      participantCount: gp._count.participants
    }));

    return NextResponse.json({
      data: formattedGroupPurchases,
      page: validatedParams.page,
      pageSize: validatedParams.pageSize
    });

  } catch (error) {
    console.error('Group purchase filter error:', error);
    return NextResponse.json({ 
      error: '그룹 구매 필터링 중 오류가 발생했습니다.', 
      details: error instanceof Error ? error.message : error 
    }, { status: 500 });
  }
}