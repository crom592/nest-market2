import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const groupPurchase = await prisma.groupPurchase.findUnique({
      where: { id: params.id },
      include: { likes: true }
    });

    if (!groupPurchase) {
      return NextResponse.json({ error: '공구를 찾을 수 없습니다.' }, { status: 404 });
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        groupPurchaseId: params.id,
        userId: session.user.id
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      return NextResponse.json({ message: '찜하기가 취소되었습니다.' });
    }

    await prisma.like.create({
      data: {
        groupPurchase: { connect: { id: params.id } },
        user: { connect: { id: session.user.id } }
      }
    });

    return NextResponse.json({ message: '찜하기가 완료되었습니다.' });
  } catch (error) {
    console.error('Error in like handler:', error);
    return NextResponse.json({ error: '찜하기 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
