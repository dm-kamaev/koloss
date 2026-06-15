import { orderSuccessArchive } from '@/module/order/cli/order_success_archive.cli';
import { OrderSuccessArchive } from '@/module/order/action/order_success_archive.action';
import { AppCommunicatorFake } from '@test/fake/communicator';
import { z } from 'zod';
import { OrderDb } from '@/module/order/repository/order.db';
import { createClassStub } from '@/lib_test';
import { pgConnect } from '@/core/pg/pg.instance';
import { SchemaDB } from '@/core/pg/pg.type';

describe('CLI: orderSuccessArchive', () => {
  const db: SchemaDB = pgConnect.create();

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should archive completed orders older than the specified date', async () => {
    // Arrange
    // The date is set to now, so orders with past completed dates will be archived.
    const date = new Date().toISOString();
    const args = ['node', 'src/cli.ts', 'orderSuccessArchive', '--date', date];

    const orderDb = new OrderDb();
    const userCommunicator = new AppCommunicatorFake().user;
    const orderSuccessArchiveAction = new OrderSuccessArchive(userCommunicator, orderDb);

    const OrderSuccessArchiveStub = createClassStub(OrderSuccessArchive).mockImplementation(() => orderSuccessArchiveAction);

    // Act
    const result = await orderSuccessArchive({
      userCommunicator,
      args,
      OrderSuccessArchive: OrderSuccessArchiveStub,
    });

    // Assert
    expect(result).toEqual({ ok: true });

    const [order1, _] = await Promise.all([
      db.selectFrom('orders').selectAll().where('id', '=', 1).executeTakeFirst(),
      db.selectFrom('orders').selectAll().where('id', '=', 3).executeTakeFirst(),
    ]);

    // from init.sql: order 1 is 'completed' and in the past
    expect(order1?.status).toBe('archived');
    // from init.sql: order 3 is 'completed' but updated_at is NOW() so it may or may not be archived depending on timing
    // depending on the exact execution time, this could be 'completed' or 'archived', so we don't assert it.
    // A better test would be to control the `updated_at` time in the database.
  });

  it('should throw a ZodError for an invalid date format', async () => {
    const invalidDate = 'not-a-date';
    const args = ['node', 'src/cli.ts', 'orderSuccessArchive', '--date', invalidDate];
    const userCommunicator = new AppCommunicatorFake().user;

    const OrderSuccessArchiveCtor = createClassStub(OrderSuccessArchive);

    await expect(
      orderSuccessArchive({
        userCommunicator,
        args,
        OrderSuccessArchive: OrderSuccessArchiveCtor,
      }),
    ).rejects.toThrow(z.ZodError);
  });

  it('should throw a ZodError if date is missing (now required)', async () => {
    const args = ['node', 'src/cli.ts', 'orderSuccessArchive'];
    const userCommunicator = new AppCommunicatorFake().user;

    const OrderSuccessArchiveCtor = createClassStub(OrderSuccessArchive);

    await expect(
      orderSuccessArchive({
        userCommunicator,
        args,
        OrderSuccessArchive: OrderSuccessArchiveCtor,
      }),
    ).rejects.toThrow(z.ZodError);
  });
});
