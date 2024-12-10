import { PrismaClient, UserRole, UserLevel, PurchaseStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 기존 데이터 삭제 (종속 관계에 따라 역순으로 삭제)
  await prisma.message.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.inquiry.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.vote.deleteMany({});
  await prisma.bid.deleteMany({});
  await prisma.participant.deleteMany({});
  await prisma.groupPurchase.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  // 샘플 사용자 생성
  const user1 = await prisma.user.create({
    data: {
      name: '박민준',
      email: 'minjun.park@example.com',
      image: 'https://via.placeholder.com/150/0000FF/808080?text=박민준',
      password: 'password123',
      role: UserRole.CONSUMER,
      level: UserLevel.BEGINNER_SPARROW,
      nickname: '참새1',
      phone: '010-1234-5678',
      businessNumber: null,
      businessLicense: null,
      participationCount: 0,
      penaltyCount: 0,
      penaltyEndTime: null,
      points: 1000,
      bidCount: 5,
      rating: 4.5,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: '이서연',
      email: 'seoyeon.lee@example.com',
      image: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=이서연',
      password: 'password123',
      role: UserRole.ADMIN,
      level: UserLevel.VIP_SPARROW,
      nickname: '관리자',
      phone: '010-2345-6789',
      businessNumber: null,
      businessLicense: null,
      participationCount: 0,
      penaltyCount: 0,
      penaltyEndTime: new Date(new Date().setDate(new Date().getDate() + 10)),
      points: 2000,
      bidCount: 10,
      rating: 4.8,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: '김도윤',
      email: 'doyun.kim@example.com',
      image: 'https://via.placeholder.com/150/FFFF00/000000?text=김도윤',
      password: 'password123',
      role: UserRole.CONSUMER,
      level: UserLevel.GOOD_SPARROW,
      nickname: '참새2',
      phone: '010-3456-7890',
      businessNumber: null,
      businessLicense: null,
      participationCount: 0,
      penaltyCount: 0,
      penaltyEndTime: new Date(new Date().setDate(new Date().getDate() + 20)),
      points: 1500,
      bidCount: 8,
      rating: 4.2,
    },
  });

  // 샘플 그룹 구매 생성
  const groupPurchase1 = await prisma.groupPurchase.create({
    data: {
      title: '최신형 노트북 공동구매',
      description: '2024년형 맥북 프로 M3 칩셋 탑재 모델 공동구매입니다. 대량구매로 20% 할인된 가격에 구매 가능합니다.',
      creatorId: user1.id,
      status: PurchaseStatus.RECRUITING,
      minParticipants: 10,
      maxParticipants: 100,
      currentParticipants: 25,
      auctionStartTime: new Date(new Date().setDate(new Date().getDate() - 1)),
      auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 7)),
      imageUrl: 'https://via.placeholder.com/400x300/0000FF/FFFFFF?text=MacBook+Pro',
      voteStartTime: new Date(new Date().setDate(new Date().getDate() - 1)),
      voteEndTime: new Date(new Date().setDate(new Date().getDate() + 2)),
      voteThreshold: 0.5, // 50%
      targetPrice: 2800000,
    },
  });

  const groupPurchase2 = await prisma.groupPurchase.create({
    data: {
      title: '프리미엄 커피머신 공동구매',
      description: '브레빌 오라클 터치 커피머신 공동구매. 정가 대비 30% 할인된 가격으로 제공됩니다.',
      creatorId: user2.id,
      status: PurchaseStatus.RECRUITING,
      minParticipants: 5,
      maxParticipants: 50,
      currentParticipants: 15,
      auctionStartTime: new Date(new Date().setDate(new Date().getDate() - 2)),
      auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 5)),
      imageUrl: 'https://via.placeholder.com/400x300/FF0000/FFFFFF?text=Coffee+Machine',
      voteStartTime: new Date(new Date().setDate(new Date().getDate() - 2)),
      voteEndTime: new Date(new Date().setDate(new Date().getDate() + 1)),
      voteThreshold: 0.3, // 30%
      targetPrice: 1500000,
    },
  });

  const groupPurchase3 = await prisma.groupPurchase.create({
    data: {
      title: '겨울 패딩 단체주문',
      description: '노스페이스 히말라야 패딩 공동구매. 10명 이상 구매시 추가 10% 할인',
      creatorId: user3.id,
      status: PurchaseStatus.DRAFT,
      minParticipants: 15,
      maxParticipants: 150,
      currentParticipants: 8,
      auctionStartTime: new Date(new Date().setDate(new Date().getDate() + 1)),
      auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 10)),
      imageUrl: 'https://via.placeholder.com/400x300/FFFF00/000000?text=Winter+Padding',
      voteStartTime: new Date(new Date().setDate(new Date().getDate() + 1)),
      voteEndTime: new Date(new Date().setDate(new Date().getDate() + 3)),
      voteThreshold: 0.75, // 75%
      targetPrice: 450000,
    },
  });

  const groupPurchase4 = await prisma.groupPurchase.create({
    data: {
      title: '유기농 식품 공동구매',
      description: '친환경 인증 유기농 과일, 채소 세트 공동구매. 직거래로 신선도 보장',
      creatorId: user1.id,
      status: PurchaseStatus.COMPLETED,
      minParticipants: 20,
      maxParticipants: 200,
      currentParticipants: 200,
      auctionStartTime: new Date(new Date().setDate(new Date().getDate() - 10)),
      auctionEndTime: new Date(new Date().setDate(new Date().getDate() - 3)),
      imageUrl: 'https://via.placeholder.com/400x300/00FF00/000000?text=Organic+Food',
      voteStartTime: new Date(new Date().setDate(new Date().getDate() - 15)),
      voteEndTime: new Date(new Date().setDate(new Date().getDate() - 12)),
      voteThreshold: 1.0, // 100%
      targetPrice: 89000,
    },
  });

  const groupPurchase5 = await prisma.groupPurchase.create({
    data: {
      title: '프로틴 보충제 공동구매',
      description: '마이프로틴 임팩트 웨이 프로틴 5kg 공동구매. 대량구매 특별할인',
      creatorId: user2.id,
      status: PurchaseStatus.RECRUITING,
      minParticipants: 8,
      maxParticipants: 80,
      currentParticipants: 40,
      auctionStartTime: new Date(new Date().setDate(new Date().getDate() - 3)),
      auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 6)),
      imageUrl: 'https://via.placeholder.com/400x300/FF00FF/FFFFFF?text=Protein',
      voteStartTime: new Date(new Date().setDate(new Date().getDate() - 3)),
      voteEndTime: new Date(new Date().setDate(new Date().getDate() + 1)),
      voteThreshold: 0.6, // 60%
      targetPrice: 120000,
    },
  });

  const groupPurchase6 = await prisma.groupPurchase.create({
    data: {
      title: '친환경 세제 대량구매',
      description: '친환경 인증 세탁세제, 주방세제 세트 공동구매. 1년치 구매시 추가할인',
      creatorId: user3.id,
      status: PurchaseStatus.RECRUITING,
      minParticipants: 12,
      maxParticipants: 120,
      currentParticipants: 70,
      auctionStartTime: new Date(new Date().setDate(new Date().getDate() - 4)),
      auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 8)),
      imageUrl: 'https://via.placeholder.com/400x300/00FFFF/000000?text=Eco+Detergent',
      voteStartTime: new Date(new Date().setDate(new Date().getDate() - 4)),
      voteEndTime: new Date(new Date().setDate(new Date().getDate() + 2)),
      voteThreshold: 0.9, // 90%
      targetPrice: 75000,
    },
  });

  const groupPurchase7 = await prisma.groupPurchase.create({
    data: {
      title: '프리미엄 요가매트 공동구매',
      description: '라이프폼 요가매트 공동구매. 정품 인증된 제품만 취급',
      creatorId: user1.id,
      status: PurchaseStatus.CANCELLED,
      minParticipants: 30,
      maxParticipants: 300,
      currentParticipants: 150,
      auctionStartTime: new Date(new Date().setDate(new Date().getDate() - 20)),
      auctionEndTime: new Date(new Date().setDate(new Date().getDate() - 10)),
      imageUrl: 'https://via.placeholder.com/400x300/800080/FFFFFF?text=Yoga+Mat',
      voteStartTime: new Date(new Date().setDate(new Date().getDate() - 25)),
      voteEndTime: new Date(new Date().setDate(new Date().getDate() - 23)),
      voteThreshold: 2.0, // 투표 총 표 수로 수정 필요
      targetPrice: 85000,
    },
  });

  const groupPurchase8 = await prisma.groupPurchase.create({
    data: {
      title: '베스트셀러 도서 세트',
      description: '2024년 상반기 베스트셀러 TOP 10 세트 공동구매. 40% 할인가',
      creatorId: user2.id,
      status: PurchaseStatus.RECRUITING,
      minParticipants: 3,
      maxParticipants: 30,
      currentParticipants: 15,
      auctionStartTime: new Date(new Date().setDate(new Date().getDate() - 5)),
      auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 4)),
      imageUrl: 'https://via.placeholder.com/400x300/FFA500/000000?text=Books',
      voteStartTime: new Date(new Date().setDate(new Date().getDate() - 5)),
      voteEndTime: new Date(new Date().setDate(new Date().getDate() + 1)),
      voteThreshold: 0.2, // 20%
      targetPrice: 250000,
    },
  });

  const groupPurchase9 = await prisma.groupPurchase.create({
    data: {
      title: '스마트워치 특가 공동구매',
      description: '갤럭시 워치 6 프로 공동구매. 통신사 공시지원금 포함 최저가',
      creatorId: user3.id,
      status: PurchaseStatus.RECRUITING,
      minParticipants: 25,
      maxParticipants: 250,
      currentParticipants: 125,
      auctionStartTime: new Date(new Date().setDate(new Date().getDate() - 6)),
      auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 9)),
      imageUrl: 'https://via.placeholder.com/400x300/008000/FFFFFF?text=Smart+Watch',
      voteStartTime: new Date(new Date().setDate(new Date().getDate() - 6)),
      voteEndTime: new Date(new Date().setDate(new Date().getDate() + 3)),
      voteThreshold: 1.5, // 투표 총 표 수로 수정 필요
      targetPrice: 450000,
    },
  });

  const groupPurchase10 = await prisma.groupPurchase.create({
    data: {
      title: '차량용 공기청정기 공동구매',
      description: '샤오미 차량용 공기청정기 신제품 공동구매. 관부가세 포함가',
      creatorId: user1.id,
      status: PurchaseStatus.RECRUITING,
      minParticipants: 6,
      maxParticipants: 60,
      currentParticipants: 30,
      auctionStartTime: new Date(new Date().setDate(new Date().getDate() - 7)),
      auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 7)),
      imageUrl: 'https://via.placeholder.com/400x300/000080/FFFFFF?text=Car+Purifier',
      voteStartTime: new Date(new Date().setDate(new Date().getDate() - 7)),
      voteEndTime: new Date(new Date().setDate(new Date().getDate() + 2)),
      voteThreshold: 0.4, // 40%
      targetPrice: 95000,
    },
  });

  // 샘플 알림 생성
  const notificationTypes = [
    'GROUP_PURCHASE',
    'PARTICIPANT',
    'VOTE_START',
    'VOTE_REMINDER',
    'GROUP_CONFIRMED',
    'REVIEW_REQUEST',
  ];

  const users = [user1, user2, user3];

  for (const user of users) {
    for (let i = 1; i <= 5; i++) {
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const isRead = Math.random() > 0.5;

      await prisma.notification.create({
        data: {
          userId: user.id,
          type,
          message: `이것은 테스트 목적으로 생성된 샘플 ${type.toLowerCase()} 알림입니다.`,
          isRead,
        },
      });
    }

    // 샘플 리뷰 생성
    for (let i = 1; i <= 3; i++) {
      await prisma.review.create({
        data: {
          userId: user.id,
          groupPurchaseId: groupPurchase1.id,
          rating: Math.floor(Math.random() * 5) + 1,
          content: '테스트용 샘플 리뷰 내용입니다.',
        },
      });
    }

    // 샘플 참여자 생성
    const groupPurchases = await prisma.groupPurchase.findMany({
      skip: 0,
      take: 3,
    });

    for (const gp of groupPurchases) {
      await prisma.participant.create({
        data: {
          userId: user.id,
          groupPurchaseId: gp.id,
          joinedAt: new Date(),
        },
      });
    }
  }

  console.log('샘플 데이터가 성공적으로 생성되었습니다.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });