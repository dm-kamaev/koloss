import { OK } from '#/lib';
import { testTransaction } from 'pg-transactional-tests';
import { promoCodeCreateToUsersDidntMakeOrderForTooLongCli } from '#/module/user/cli/promocode_send_to_users_didnt_make_order_for_too_long.cli';
import { emailClientInstance } from '#/core/email/email_client.instance';
import { z } from 'zod';
import { createMockClass } from '#/lib';
import { pgConnect } from '#/core/pg/pg.instance';
import { AppCommunicatorFake } from '#test/fake/communicator';
import { OrderCommunicatorFake } from '#test/fake/module/order/order.communicator';
import { UserDbFake } from '#test/fake/module/user/repository/user.db fake';
import { OrderDbFake } from '#test/fake/module/order/repository/order.db.fake';
import { PromoCodeCreateToUsersDidntMakeOrderForTooLong } from '#/module/user/action/promocode_create_to_users_didnt_make_order_for_too_long.action';

describe('CLI: promoCodeCreateToUsersDidntMakeOrderForTooLong', () => {
  let dispatchEmailSpy: jest.SpyInstance;

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
    await pgConnect.destroy();
  });

  it('should send promo codes to inactive users based on CLI argument', async () => {
    // Arrange
    const activeUser = { id: 2678, email: 'jane1.doe@example.com', name: 'Jane', last_name: 'Doe' };
    const userDb = new UserDbFake();
    await userDb.insert(activeUser);

    const now = new Date();
    const fortyDaysAgo = new Date(new Date().setDate(now.getDate() - 40));
    const lastOrderInactive = OrderDbFake.generate({
      userId: UserDbFake.defaultUser.id,
      updatedAt: fortyDaysAgo,
    });

    const tenDaysAgo = new Date(new Date().setDate(now.getDate() - 10));
    const lastOrderActive = OrderDbFake.generate({
      userId: activeUser.id,
      updatedAt: tenDaysAgo,
    });

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
    const result = await promoCodeCreateToUsersDidntMakeOrderForTooLongCli({
      PromoCodeCreateToUsersDidntMakeOrderForTooLong, // Use the actual constructor
      orderCommunicator: new AppCommunicatorFake({ OrderCommunicatorCtor }).order,
      args,
    });

    // Assert
    expect(result).toEqual(OK);
    expect(dispatchEmailSpy).toHaveBeenCalledTimes(1);
    expect(dispatchEmailSpy).toHaveBeenCalledWith(UserDbFake.defaultUser.email, 'We miss you!', expect.any(String));
  });

  it('should not send promo codes if no users are inactive', async () => {
    // Arrange
    const now = new Date();
    const lastOrderActive = OrderDbFake.generate({
      userId: UserDbFake.defaultUser.id,
      updatedAt: new Date(new Date().setDate(now.getDate() - 10)),
    });

    const OrderCommunicatorCtor = createMockClass(OrderCommunicatorFake, {
      findLastOrderByUserId: async (userId) => {
        if (userId === UserDbFake.defaultUser.id) {
          return lastOrderActive;
        }
        return undefined;
      },
    });

    const args = ['node', 'src/cli.ts', 'promoSend', '-d', '30'];

    // Act
    const result = await promoCodeCreateToUsersDidntMakeOrderForTooLongCli({
      PromoCodeCreateToUsersDidntMakeOrderForTooLong,
      orderCommunicator: new AppCommunicatorFake({ OrderCommunicatorCtor }).order,
      args,
    });

    // Assert
    expect(result).toEqual(OK);
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
      promoCodeCreateToUsersDidntMakeOrderForTooLongCli({
        PromoCodeCreateToUsersDidntMakeOrderForTooLong, // Use the actual constructor
        orderCommunicator: new AppCommunicatorFake().order,
        args,
      }),
    ).rejects.toThrow(z.ZodError);
  });

  it('should throw a ZodError if inactivityDays is missing', async () => {
    const args = ['node', 'src/cli.ts', 'promoSend'];

    // Act
    await expect(
      promoCodeCreateToUsersDidntMakeOrderForTooLongCli({
        PromoCodeCreateToUsersDidntMakeOrderForTooLong, // Use the actual constructor
        orderCommunicator: new AppCommunicatorFake().order,
        args,
      }),
    ).rejects.toThrow(z.ZodError);
  });
});
