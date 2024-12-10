import prisma from '@/lib/prisma';

export async function createNotification({
  userId,
  type,
  title,
  content,
  data,
}: {
  userId: string;
  type: string;
  title: string;
  content: string;
  data?: Record<string, unknown>;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        content,
        data: data ? JSON.stringify(data) : null,
      },
    });

    // In a production environment, you would trigger a WebSocket event here
    // to notify the client about the new notification
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function sendVoteReminder(userId: string, groupPurchaseId: string, voteEndTime: Date) {
  return createNotification({
    userId,
    type: 'VOTE_REMINDER',
    title: '투표 참여 알림',
    content: '아직 투표에 참여하지 않으셨습니다. 투표에 참여해주세요.',
    data: {
      groupPurchaseId,
      voteEndTime: voteEndTime.toISOString(),
    },
  });
}

export async function sendVoteResult(
  userId: string,
  groupPurchaseId: string,
  isConfirmed: boolean
) {
  return createNotification({
    userId,
    type: isConfirmed ? 'GROUP_CONFIRMED' : 'GROUP_CANCELED',
    title: isConfirmed ? '공구 확정 알림' : '공구 취소 알림',
    content: isConfirmed
      ? '투표 결과로 공구가 확정되었습니다.'
      : '투표 결과로 공구가 취소되었습니다.',
    data: {
      groupPurchaseId,
    },
  });
}

export async function sendReviewRequest(userId: string, groupPurchaseId: string) {
  return createNotification({
    userId,
    type: 'REVIEW_REQUEST',
    title: '후기 작성 요청',
    content: '공구가 완료되었습니다. 후기를 작성해주세요.',
    data: {
      groupPurchaseId,
    },
  });
}

export async function sendPenaltyNotification(
  userId: string,
  penaltyEndTime: Date,
  penaltyCount: number
) {
  return createNotification({
    userId,
    type: 'PENALTY',
    title: '패널티 부과 알림',
    content: `${penaltyCount}회 패널티가 부과되었습니다. ${penaltyEndTime.toLocaleDateString()}까지 참여가 제한됩니다.`,
    data: {
      penaltyEndTime: penaltyEndTime.toISOString(),
      penaltyCount,
    },
  });
}
