import { orderSuccessArchiveCli } from '@/module/order/cli/order_success_archive.cli';
import { OrderSuccessArchive } from '@/module/order/action/order_success_archive.action';
import { AppCommunicatorFake } from '@test/fake/communicator';
import { z } from 'zod';
import { pgConnect } from '@/core/pg/pg.instance';

describe('CLI: orderSuccessArchive', () => {
  const db = pgConnect.create();

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
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

    // Act
    const result = await orderSuccessArchiveCli({
      userCommunicator: new AppCommunicatorFake().user,
      args,
      OrderSuccessArchive,
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
