import { NextRequest } from 'next/server';
import { GET } from '../route';
import {
  cleanupDatabase,
  createTestUser,
  createTestGroupPurchase,
  mockSession,
  prisma,
} from '@/lib/test/helpers';
import { getServerSession } from 'next-auth';

const mockGetServerSession = getServerSession as jest.Mock;

describe('Participating Group Purchases API', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  describe('GET /api/group-purchases/participating', () => {
    it('should return unauthorized error when not logged in', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const req = new NextRequest(
        'http://localhost:3000/api/group-purchases/participating'
      );
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('로그인이 필요합니다.');
    });

    it('should return empty list when user has no participating purchases', async () => {
      const user = await createTestUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      mockGetServerSession.mockResolvedValueOnce(await mockSession(user.id));

      const req = new NextRequest(
        'http://localhost:3000/api/group-purchases/participating'
      );
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.groupPurchases).toHaveLength(0);
      expect(data.pagination.total).toBe(0);
    });

    it('should return participating group purchases', async () => {
      const user = await createTestUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      const otherUser = await createTestUser({
        email: 'other@example.com',
        name: 'Other User',
      });

      mockGetServerSession.mockResolvedValueOnce(await mockSession(user.id));

      // Create group purchases
      const [participating1, participating2, nonParticipating] = await Promise.all([
        createTestGroupPurchase({
          title: 'Participating Purchase 1',
          description: 'Test Description',
          creatorId: otherUser.id,
          targetPrice: 1000,
          minParticipants: 2,
          maxParticipants: 10,
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }),
        createTestGroupPurchase({
          title: 'Participating Purchase 2',
          description: 'Test Description',
          creatorId: otherUser.id,
          targetPrice: 1000,
          minParticipants: 2,
          maxParticipants: 10,
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }),
        createTestGroupPurchase({
          title: 'Non-Participating Purchase',
          description: 'Test Description',
          creatorId: otherUser.id,
          targetPrice: 1000,
          minParticipants: 2,
          maxParticipants: 10,
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }),
      ]);

      // Add user as participant
      await Promise.all([
        prisma.participant.create({
          data: {
            userId: user.id,
            groupPurchaseId: participating1.id,
          },
        }),
        prisma.participant.create({
          data: {
            userId: user.id,
            groupPurchaseId: participating2.id,
          },
        }),
      ]);

      const req = new NextRequest(
        'http://localhost:3000/api/group-purchases/participating'
      );
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.groupPurchases).toHaveLength(2);
      expect(data.pagination.total).toBe(2);
      expect(data.groupPurchases.map((p: any) => p.id)).toEqual(
        expect.arrayContaining([participating1.id, participating2.id])
      );
      expect(data.groupPurchases.map((p: any) => p.id)).not.toContain(
        nonParticipating.id
      );
    });

    it('should include bid information for participating purchases', async () => {
      const user = await createTestUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      const otherUser = await createTestUser({
        email: 'other@example.com',
        name: 'Other User',
      });

      mockGetServerSession.mockResolvedValueOnce(await mockSession(user.id));

      // Create group purchase
      const purchase = await createTestGroupPurchase({
        title: 'Bidding Purchase',
        description: 'Test Description',
        creatorId: otherUser.id,
        targetPrice: 1000,
        minParticipants: 2,
        maxParticipants: 10,
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'BIDDING',
      });

      // Add user as participant and create bid
      await prisma.participant.create({
        data: {
          userId: user.id,
          groupPurchaseId: purchase.id,
        },
      });

      await prisma.bid.create({
        data: {
          userId: user.id,
          groupPurchaseId: purchase.id,
          amount: 900,
        },
      });

      const req = new NextRequest(
        'http://localhost:3000/api/group-purchases/participating'
      );
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.groupPurchases).toHaveLength(1);
      expect(data.groupPurchases[0].id).toBe(purchase.id);
      expect(data.groupPurchases[0].currentBid).toBeDefined();
      expect(data.groupPurchases[0].currentBid.amount).toBe(900);
    });
  });
});
