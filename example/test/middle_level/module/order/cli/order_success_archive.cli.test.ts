import { orderSuccessArchive } from '@/module/order/cli/order_success_archive.cli';
import { OrderSuccessArchive } from '@/module/order/action/order_success_archive.action';
import { AppCommunicatorFake } from '@test/fake/communicator';
import { z } from 'zod';
import { OrderDbFake } from '@test/fake/module/order/repository/order.db';
import { OrderRaw } from '@/module/order/repository/order.db';
import { createClassStub } from '@/lib_test';

describe('CLI: orderSuccessArchive', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should archive completed orders older than the specified date', async () => {
    // Arrange
    const date = '2024-01-01T00:00:00.000Z';
    const args = ['node', 'src/cli.ts', 'orderSuccessArchive', '--date', date];

    const ordersToSeed: OrderRaw[] = [
      { ...OrderDbFake.defaultOrder, id: 1, status: 'completed', updatedAt: new Date('2023-12-01T00:00:00.000Z') },
      { ...OrderDbFake.defaultOrder, id: 2, status: 'completed', updatedAt: new Date('2023-12-15T00:00:00.000Z') },
      { ...OrderDbFake.defaultOrder, id: 3, status: 'completed', updatedAt: new Date('2024-01-02T00:00:00.000Z') },
      { ...OrderDbFake.defaultOrder, id: 4, status: 'pending', updatedAt: new Date('2023-12-01T00:00:00.000Z') },
    ];
    const orderDbFake = new OrderDbFake(ordersToSeed);
    const userCommunicator = new AppCommunicatorFake().user;
    const orderSuccessArchiveAction = new OrderSuccessArchive(userCommunicator, orderDbFake);

    const OrderSuccessArchiveStub = createClassStub(OrderSuccessArchive).mockImplementation(() => orderSuccessArchiveAction);

    // Act
    const result = await orderSuccessArchive({
      userCommunicator,
      args,
      OrderSuccessArchive: OrderSuccessArchiveStub,
    });

    // Assert
    expect(result).toEqual({ ok: true });

    const [order1, order2, order3, order4] = await Promise.all([
      orderDbFake.getById(1),
      orderDbFake.getById(2),
      orderDbFake.getById(3),
      orderDbFake.getById(4),
    ]);

    expect(order1?.status).toBe('archived');
    expect(order2?.status).toBe('archived');
    expect(order3?.status).toBe('completed');
    expect(order4?.status).toBe('pending');
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
