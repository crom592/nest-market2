import { PrismaClient, ProductCategory, PurchaseStatus } from '@prisma/client';

async function testGroupPurchaseFilters() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 그룹 구매 필터링 테스트 시작 🧪');

    // 1. 기존 사용자 조회
    const users = await prisma.user.findMany({
      take: 3,
      orderBy: { createdAt: 'asc' }
    });

    if (users.length === 0) {
      console.error('❌ 사용자 데이터가 없습니다.');
      return;
    }

    // 2. 카테고리별 필터링 테스트
    console.log('\n📋 카테고리별 필터링 테스트:');
    const categories = Object.values(ProductCategory);
    
    for (const category of categories) {
      const filteredPurchases = await prisma.groupPurchase.findMany({
        where: { category },
        orderBy: { popularity: 'desc' },
        take: 5,
        include: {
          _count: {
            select: { 
              participants: true,
              bids: true 
            }
          }
        }
      });

      console.log(`\n🔍 ${category} 카테고리 필터링 결과:`);
      filteredPurchases.forEach(gp => {
        console.log({
          title: gp.title,
          category: gp.category,
          popularity: gp.popularity,
          participantCount: gp._count.participants,
          bidCount: gp._count.bids,
          status: gp.status
        });
      });
    }

    // 3. 상태별 그룹 구매 조회
    console.log('\n📊 상태별 그룹 구매 조회:');
    const statuses = Object.values(PurchaseStatus);
    
    for (const status of statuses) {
      const statusPurchases = await prisma.groupPurchase.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' },
        take: 3
      });

      console.log(`\n🏷️ ${status} 상태의 그룹 구매:`);
      statusPurchases.forEach(gp => {
        console.log({
          title: gp.title,
          status: gp.status,
          createdAt: gp.createdAt,
          creator: gp.creatorId
        });
      });
    }

    // 4. 인기도 및 참여자 수 기반 정렬 테스트
    console.log('\n🏆 인기도 및 참여자 수 기반 정렬 테스트:');
    const popularPurchases = await prisma.groupPurchase.findMany({
      orderBy: [
        { popularity: 'desc' },
        { participantCount: 'desc' }
      ],
      take: 5,
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });

    console.log('인기 그룹 구매:');
    popularPurchases.forEach(gp => {
      console.log({
        title: gp.title,
        popularity: gp.popularity,
        participantCount: gp.participantCount,
        actualParticipants: gp._count.participants
      });
    });

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGroupPurchaseFilters().catch(console.error);
