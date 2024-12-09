import { NextRequest } from 'next/server';
import { GET } from '../route';
import {
  cleanupDatabase,
  createTestUser,
  createTestGroupPurchase,
  mockSession,
} from '@/lib/test/helpers';
import { getServerSession } from 'next-auth';

const mockGetServerSession = getServerSession as jest.Mock;

describe('Group Purchases API', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  describe('GET /api/group-purchases', () => {
    it('should return unauthorized error when not logged in', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const req = new NextRequest('http://localhost:3000/api/group-purchases');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('로그인이 필요합니다.');
    });

    it('should return empty list when no group purchases exist', async () => {
      const user = await createTestUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      mockGetServerSession.mockResolvedValueOnce(await mockSession(user.id));

      const req = new NextRequest('http://localhost:3000/api/group-purchases');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.groupPurchases).toHaveLength(0);
      expect(data.pagination.total).toBe(0);
    });

    it('should return group purchases with pagination', async () => {
      const user = await createTestUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      mockGetServerSession.mockResolvedValueOnce(await mockSession(user.id));

      // Create 15 group purchases
      const purchases = await Promise.all(
        Array.from({ length: 15 }, (_, i) =>
          createTestGroupPurchase({
            title: `Test Purchase ${i + 1}`,
            description: 'Test Description',
            creatorId: user.id,
            targetPrice: 1000,
            minParticipants: 2,
            maxParticipants: 10,
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          })
        )
      );

      // Request first page
      const req1 = new NextRequest(
        'http://localhost:3000/api/group-purchases?page=1&limit=10'
      );
      const response1 = await GET(req1);
      const data1 = await response1.json();

      expect(response1.status).toBe(200);
      expect(data1.groupPurchases).toHaveLength(10);
      expect(data1.pagination.total).toBe(15);
      expect(data1.pagination.pages).toBe(2);

      // Request second page
      const req2 = new NextRequest(
        'http://localhost:3000/api/group-purchases?page=2&limit=10'
      );
      const response2 = await GET(req2);
      const data2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(data2.groupPurchases).toHaveLength(5);
      expect(data2.pagination.total).toBe(15);
      expect(data2.pagination.pages).toBe(2);
    });

    it('should filter group purchases by status', async () => {
      const user = await createTestUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      mockGetServerSession.mockResolvedValueOnce(await mockSession(user.id));

      // Create purchases with different statuses
      await Promise.all([
        createTestGroupPurchase({
          title: 'Active Purchase',
          description: 'Test Description',
          creatorId: user.id,
          targetPrice: 1000,
          minParticipants: 2,
          maxParticipants: 10,
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        }),
        createTestGroupPurchase({
          title: 'Completed Purchase',
          description: 'Test Description',
          creatorId: user.id,
          targetPrice: 1000,
          minParticipants: 2,
          maxParticipants: 10,
          endTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 'COMPLETED',
        }),
      ]);

      // Filter by ACTIVE status
      const req1 = new NextRequest(
        'http://localhost:3000/api/group-purchases?status=ACTIVE'
      );
      const response1 = await GET(req1);
      const data1 = await response1.json();

      expect(response1.status).toBe(200);
      expect(data1.groupPurchases).toHaveLength(1);
      expect(data1.groupPurchases[0].status).toBe('ACTIVE');

      // Filter by COMPLETED status
      const req2 = new NextRequest(
        'http://localhost:3000/api/group-purchases?status=COMPLETED'
      );
      const response2 = await GET(req2);
      const data2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(data2.groupPurchases).toHaveLength(1);
      expect(data2.groupPurchases[0].status).toBe('COMPLETED');
    });
  });
});
