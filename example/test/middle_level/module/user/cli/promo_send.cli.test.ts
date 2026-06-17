import { testTransaction } from 'pg-transactional-tests';
import { promoSendCli } from '@/module/user/cli/promo_send.cli';
import { PromoSend } from '@/module/user/action/promo_send.action';
import { emailClientInstance } from '@/core/email/email_client.instance';
import { OrderRaw } from '@/module/order/repository/order.db';
import { z } from 'zod';
import { createMockClass } from '@/lib_test';
import { pgConnect } from '@/core/pg/pg.instance';
import { AppCommunicatorFake } from '@test/fake/communicator';
import { OrderCommunicatorFake } from '@test/fake/module/order/order.communicator';
import { UserDbFake } from '@test/fake/module/user/repository/user.db fake';

describe('CLI: promoSend', () => {
  let dispatchEmailSpy: jest.SpyInstance;
  const db = pgConnect.create();

  beforeEach(async () => {
    dispatchEmailSpy = jest.spyOn(emailClientInstance, 'dispatch').mockReturnValue(undefined);
    jest.spyOn(console, 'log').mockImplementation(() => {});

    await pgConnect.rebuild();
    await testTransaction.start();
  });

  afterEach(async () => {
    await testTransaction.rollback();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should send promo codes to inactive users based on CLI argument', async () => {
    // Arrange
    const activeUser = { id: 2678, email: 'jane1.doe@example.com', name: 'Jane', last_name: 'Doe' };
    await db.insertInto('users').values([activeUser]).execute();

    const now = new Date();
    const fortyDaysAgo = new Date(new Date().setDate(now.getDate() - 40));
    const lastOrderInactive: OrderRaw = {
      id: 1,
      userId: UserDbFake.defaultUser.id,
      products: [{ name: 'Apple', amount: 1, price: 10 }],
      price: 10,
      status: 'completed',
      updatedAt: fortyDaysAgo,
    };

    const tenDaysAgo = new Date(new Date().setDate(now.getDate() - 10));
    const lastOrderActive: OrderRaw = {
      id: 3,
      userId: activeUser.id,
      products: [{ name: 'Banana', amount: 3, price: 5 }],
      price: 15,
      status: 'completed',
      updatedAt: tenDaysAgo,
    };

    const OrderCommunicatorCtor = createMockClass(OrderCommunicatorFake, {
      findLastOrderByUserId: async (userId) => {
        if (userId === UserDbFake.defaultUser.id) {
          return lastOrderInactive;
        }
        if (userId === activeUser.id) {
          return lastOrderActive;
        }
        return undefined;
      },
    });

    const args = ['node', 'src/cli.ts', 'promoSend', '-d', '30']; // Inactivity threshold: 30 days

    // Act
    const result = await promoSendCli({
      PromoSend, // Use the actual constructor
      orderCommunicator: new AppCommunicatorFake({ OrderCommunicatorCtor }).order,
      args,
    });

    // Assert
    expect(result).toEqual({ ok: true });
    expect(dispatchEmailSpy).toHaveBeenCalledTimes(1);
    expect(dispatchEmailSpy).toHaveBeenCalledWith(UserDbFake.defaultUser.email, 'We miss you!', expect.any(String));
  });

  it('should not send promo codes if no users are inactive', async () => {
    // Arrange
    const now = new Date();
    const tenDaysAgo = new Date(new Date().setDate(now.getDate() - 10));
    const lastOrderActive: OrderRaw = {
      id: 1,
      userId: UserDbFake.defaultUser.id,
      products: [{ name: 'Milk', amount: 4, price: 15 }],
      price: 60,
      status: 'completed',
      updatedAt: tenDaysAgo,
    };

    const OrderCommunicatorCtor = createMockClass(OrderCommunicatorFake, {
      findLastOrderByUserId: async (userId) => {
        if (userId === UserDbFake.defaultUser.id) {
          return lastOrderActive;
        }
        return undefined;
      },
    });

    const args = ['node', 'src/cli.ts', 'promoSend', '-d', '30']; // Inactivity threshold: 30 days

    // Act
    const result = await promoSendCli({
      PromoSend, // Use the actual constructor
      orderCommunicator: new AppCommunicatorFake({ OrderCommunicatorCtor }).order,
      args,
    });
    // Assert
    expect(result).toEqual({ ok: true });
    expect(dispatchEmailSpy).not.toHaveBeenCalled();
  });
});

describe('CLI: promoSend [Validation]', () => {
  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('should throw a ZodError for invalid inactivityDays format', async () => {
    const args = ['node', 'src/cli.ts', 'promoSend', '-d', 'not-a-number'];

    // Act
    await expect(
      promoSendCli({
        PromoSend, // Use the actual constructor
        orderCommunicator: new AppCommunicatorFake().order,
        args,
      }),
    ).rejects.toThrow(z.ZodError);
  });

  it('should throw a ZodError if inactivityDays is missing', async () => {
    const args = ['node', 'src/cli.ts', 'promoSend'];

    // Act
    await expect(
      promoSendCli({
        PromoSend, // Use the actual constructor
        orderCommunicator: new AppCommunicatorFake().order,
        args,
      }),
    ).rejects.toThrow(z.ZodError);
  });
});
