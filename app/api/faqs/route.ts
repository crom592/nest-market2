import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const faqSchema = z.object({
  category: z.enum(['GROUP_PURCHASE', 'GENERAL_USER', 'SELLER', 'SERVICE', 'TECHNICAL']),
  question: z.string().min(1),
  answer: z.string().min(1),
  priority: z.number().min(0).default(0)
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자만 FAQ를 등록할 수 있습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const data = faqSchema.parse(body);

    const faq = await prisma.faq.create({
      data: {
        category: data.category,
        question: data.question,
        answer: data.answer,
        priority: data.priority
      }
    });

    return NextResponse.json({
      message: 'FAQ가 성공적으로 등록되었습니다.',
      faq
    });
  } catch (error) {
    console.error('Error in FAQ creation:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '유효하지 않은 요청입니다.', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'FAQ 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where = {
      ...(category && { category }),
      ...(search && {
        OR: [
          { question: { contains: search, mode: 'insensitive' } },
          { answer: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const faqs = await prisma.faq.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    return NextResponse.json({ faqs });
  } catch (error) {
    console.error('Error in get FAQs:', error);
    return NextResponse.json(
      { error: 'FAQ 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Update FAQ
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자만 FAQ를 수정할 수 있습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...data } = faqSchema.parse(body);

    const faq = await prisma.faq.update({
      where: { id },
      data
    });

    return NextResponse.json({
      message: 'FAQ가 성공적으로 수정되었습니다.',
      faq
    });
  } catch (error) {
    console.error('Error in FAQ update:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '유효하지 않은 요청입니다.', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'FAQ 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Delete FAQ
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자만 FAQ를 삭제할 수 있습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'FAQ ID가 필요합니다.' }, { status: 400 });
    }

    await prisma.faq.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'FAQ가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Error in FAQ deletion:', error);
    return NextResponse.json(
      { error: 'FAQ 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
