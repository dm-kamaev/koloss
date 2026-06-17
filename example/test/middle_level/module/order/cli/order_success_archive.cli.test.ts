import { testTransaction } from 'pg-transactional-tests';
import { orderSuccessArchiveCli } from '@/module/order/cli/order_success_archive.cli';
import { OrderSuccessArchive } from '@/module/order/action/order_success_archive.action';
import { AppCommunicatorFake } from '@test/fake/communicator';
import { z } from 'zod';
import { pgConnect } from '@/core/pg/pg.instance';
import { SchemaDB } from '@/core/pg/pg.type';

describe('CLI: orderSuccessArchive', () => {
  let db: SchemaDB;

  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    await pgConnect.rebuild();
    await testTransaction.start();
    db = pgConnect.create();
  });

  afterEach(async () => {
    await testTransaction.rollback();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await pgConnect.destroy();
  });

  it('should archive completed orders older than the specified date', async () => {
    // Arrange
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3_600_000);
    const twoDaysAgo = new Date(now.getTime() - 172_800_000);
    const date = oneHourAgo.toISOString();
    const args = ['node', 'src/cli.ts', 'orderSuccessArchive', '--date', date];

    // Insert a completed order older than the cutoff (should be archived)
    const { id: oldOrderId } = await db
      .insertInto('orders')
      .values({
        user_id: 1234,
        products: JSON.stringify([]),
        price: 10,
        status: 'completed',
        updated_at: twoDaysAgo as unknown as string,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    // Insert a completed order newer than the cutoff (should NOT be archived)
    const { id: newOrderId } = await db
      .insertInto('orders')
      .values({
        user_id: 1234,
        products: JSON.stringify([]),
        price: 5,
        status: 'completed',
        updated_at: now as unknown as string,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    // Act
    const result = await orderSuccessArchiveCli({
      userCommunicator: new AppCommunicatorFake().user,
      args,
      OrderSuccessArchive,
    });

    // Assert
    expect(result).toEqual({ ok: true });

    const [oldOrder, newOrder] = await Promise.all([
      db.selectFrom('orders').selectAll().where('id', '=', oldOrderId).executeTakeFirst(),
      db.selectFrom('orders').selectAll().where('id', '=', newOrderId).executeTakeFirst(),
    ]);

    expect(oldOrder?.status).toBe('archived');
    expect(newOrder?.status).toBe('completed');
  });
});

describe('CLI: orderSuccessArchive [Validation]', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw a ZodError for an invalid date format', async () => {
    const invalidDate = 'not-a-date';
    const args = ['node', 'src/cli.ts', 'orderSuccessArchive', '--date', invalidDate];

    await expect(
      orderSuccessArchiveCli({
        userCommunicator: new AppCommunicatorFake().user,
        args,
        OrderSuccessArchive,
      }),
    ).rejects.toThrow(z.ZodError);
  });

  it('should throw a ZodError if date is missing (now required)', async () => {
    const args = ['node', 'src/cli.ts', 'orderSuccessArchive'];

    await expect(
      orderSuccessArchiveCli({
        userCommunicator: new AppCommunicatorFake().user,
        args,
        OrderSuccessArchive,
      }),
    ).rejects.toThrow(z.ZodError);
  });
});
