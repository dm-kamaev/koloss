import { testTransaction } from 'pg-transactional-tests';
import { promoSendCli } from '@/module/user/cli/promo_send.cli';
import { PromoSend } from '@/module/user/action/promo_send.action';
import { OrderCommunicator } from '@/module/order/order.communicator';
import { emailClientInstance } from '@/core/email/email_client.instance';
import { OrderRaw } from '@/module/order/repository/order.db';
import { z } from 'zod';
import { createMockClass } from '@/lib_test';
import { pgConnect } from '@/core/pg/pg.instance';
import { AppCommunicatorFake } from '@test/fake/communicator';

describe('CLI: promoSend', () => {
  let dispatchEmailSpy: jest.SpyInstance;

  beforeEach(async () => {
    await pgConnect.rebuild();
    await testTransaction.start();
    dispatchEmailSpy = jest.spyOn(emailClientInstance, 'dispatch').mockReturnValue(undefined);
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    await testTransaction.rollback();
    jest.restoreAllMocks();
  });

  it('should send promo codes to inactive users based on CLI argument', async () => {
    // Arrange
    const inactiveUser = { id: 1234, email: 'test@example.com', name: 'Vasya', last_name: 'Ivanov' }; // From init.sql
    const activeUser = { id: 2, email: 'jane.doe@example.com', name: 'Jane', last_name: 'Doe' }; // From init.sql

    const now = new Date();
    const fortyDaysAgo = new Date(new Date().setDate(now.getDate() - 40));
    const lastOrderInactive: OrderRaw = {
      id: 1, // from init.sql
      userId: inactiveUser.id,
      products: [{ name: 'Apple', amount: 1, price: 10 }],
      price: 10,
      status: 'completed',
      updatedAt: fortyDaysAgo,
    };

    const tenDaysAgo = new Date(new Date().setDate(now.getDate() - 10));
    const lastOrderActive: OrderRaw = {
      id: 3, // from init.sql
      userId: activeUser.id,
      products: [{ name: 'Banana', amount: 3, price: 5 }],
      price: 15,
      status: 'completed',
      updatedAt: tenDaysAgo,
    };

    const OrderCommunicatorCtor = createMockClass(OrderCommunicator, {
      getLastByUserId: async (userId: number) => {
        if (userId === inactiveUser.id) {
          return lastOrderInactive;
        }
        if (userId === activeUser.id) {
          return lastOrderActive;
        }
        return null;
      },
    });

    const args = ['node', 'src/cli.ts', 'promoSend', '-d', '30']; // Inactivity threshold: 30 days

    // Act
    const result = await promoSendCli({
      PromoSend, // Use the actual constructor
      orderCommunicator: new AppCommunicatorFake().order,
      args,
    });

    // Assert
    expect(result).toEqual({ ok: true });
    expect(dispatchEmailSpy).toHaveBeenCalledTimes(1);
    expect(dispatchEmailSpy).toHaveBeenCalledWith(inactiveUser.email, 'We miss you!', expect.any(String));
  });

  it('should not send promo codes if no users are inactive', async () => {
    // Arrange
    const activeUser = { id: 1, email: 'active@example.com', name: 'John', last_name: 'Doe' };

    const now = new Date();
    const tenDaysAgo = new Date(new Date().setDate(now.getDate() - 10));
    const lastOrderActive: OrderRaw = {
      id: 1,
      userId: activeUser.id,
      products: [{ name: 'Milk', amount: 4, price: 15 }],
      price: 60,
      status: 'completed',
      updatedAt: tenDaysAgo,
    };

    const OrderCommunicatorCtor = createMockClass(OrderCommunicator, {
      getLastByUserId: async (userId: number) => {
        if (userId === activeUser.id) {
          return lastOrderActive;
        }
        return null;
      },
    });

    const args = ['node', 'src/cli.ts', 'promoSend', '-d', '30']; // Inactivity threshold: 30 days

    // Act
    const result = await promoSendCli({
      PromoSend, // Use the actual constructor
      orderCommunicator: new AppCommunicatorFake({ OrderCommunicatorCtor: OrderCommunicatorCtor }).order,
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
