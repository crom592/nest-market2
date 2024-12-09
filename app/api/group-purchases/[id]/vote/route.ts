import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupPurchase = await prisma.groupPurchase.findUnique({
      where: { id: params.id },
      select: {
        status: true,
        voteStartTime: true,
        voteEndTime: true,
        voteThreshold: true,
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!groupPurchase) {
      return NextResponse.json(
        { error: '공동구매를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (groupPurchase.status !== 'VOTING') {
      return NextResponse.json(
        { error: '현재 투표가 진행중이 아닙니다.' },
        { status: 400 }
      );
    }

    // Calculate voting statistics
    const totalVotes = groupPurchase.votes.length;
    const approvedVotes = groupPurchase.votes.filter(vote => vote.approved).length;
    const approvalRate = totalVotes > 0 ? approvedVotes / totalVotes : 0;

    return NextResponse.json({
      votes: groupPurchase.votes,
      statistics: {
        total: totalVotes,
        approved: approvedVotes,
        approvalRate,
        threshold: groupPurchase.voteThreshold,
        startTime: groupPurchase.voteStartTime,
        endTime: groupPurchase.voteEndTime,
      },
    });
  } catch (error) {
    console.error('Failed to fetch votes:', error);
    return NextResponse.json(
      { error: '투표 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { approved } = body;

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: '올바른 투표 값을 입력해주세요.' },
        { status: 400 }
      );
    }

    // Check if user is a participant
    const participant = await prisma.participant.findUnique({
      where: {
        userId_groupPurchaseId: {
          userId: session.user.id,
          groupPurchaseId: params.id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: '공동구매 참여자만 투표할 수 있습니다.' },
        { status: 403 }
      );
    }

    const groupPurchase = await prisma.groupPurchase.findUnique({
      where: { id: params.id },
      select: {
        status: true,
        voteStartTime: true,
        voteEndTime: true,
        voteThreshold: true,
        currentParticipants: true,
        votes: true,
      },
    });

    if (!groupPurchase) {
      return NextResponse.json(
        { error: '공동구매를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (groupPurchase.status !== 'VOTING') {
      return NextResponse.json(
        { error: '현재 투표가 진행중이 아닙니다.' },
        { status: 400 }
      );
    }

    const now = new Date();
    if (
      groupPurchase.voteStartTime &&
      groupPurchase.voteEndTime &&
      (now < groupPurchase.voteStartTime || now > groupPurchase.voteEndTime)
    ) {
      return NextResponse.json(
        { error: '투표 기간이 아닙니다.' },
        { status: 400 }
      );
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_groupPurchaseId: {
          userId: session.user.id,
          groupPurchaseId: params.id,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: '이미 투표하셨습니다.' },
        { status: 400 }
      );
    }

    // Create vote
    const vote = await prisma.vote.create({
      data: {
        userId: session.user.id,
        groupPurchaseId: params.id,
        approved,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Check if all participants have voted and update status if needed
    const totalVotes = groupPurchase.votes.length + 1;
    if (totalVotes >= groupPurchase.currentParticipants) {
      const approvedVotes = groupPurchase.votes.filter(v => v.approved).length + (approved ? 1 : 0);
      const approvalRate = approvedVotes / totalVotes;

      if (approvalRate >= groupPurchase.voteThreshold) {
        await prisma.groupPurchase.update({
          where: { id: params.id },
          data: {
            status: 'CONFIRMED',
          },
        });
      } else {
        await prisma.groupPurchase.update({
          where: { id: params.id },
          data: {
            status: 'CANCELLED',
          },
        });
      }
    }

    return NextResponse.json({
      vote,
      message: '투표가 완료되었습니다.',
    });
  } catch (error) {
    console.error('Failed to vote:', error);
    return NextResponse.json(
      { error: '투표에 실패했습니다.' },
      { status: 500 }
    );
  }
}
