import { PromoSend } from '@/module/user/action/promo_send.action';

import { UserDbInMemoryFake } from '@test/fake/module/user/repository/user.db.fake.in_memory';
import { OrderCommunicatorFake } from '@test/fake/module/order/order.communicator';
import { emailClientInstance } from '@/core/email/email_client.instance';
import { OrderRaw } from '@/module/order/repository/order.db';
import { AppCommunicatorFake } from '@test/fake/communicator';

describe('PromoSend', () => {
  let dispatchEmailSpy: jest.SpyInstance;

  beforeEach(() => {
    dispatchEmailSpy = jest.spyOn(emailClientInstance, 'dispatch').mockReturnValue(undefined);
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should send promo codes to users with no orders', async () => {
    const userWithoutOrders = { id: 1, email: 'noorder@example.com', name: 'John', last_name: 'Doe' };
    const userDbFake = new UserDbInMemoryFake({ users: [userWithoutOrders] });
    const orderCommunicatorFake = new OrderCommunicatorFake(new AppCommunicatorFake().user, {
      stubs: {
        getLastByUserId: () => Promise.resolve(null),
      },
    });
    const promoSend = new PromoSend(userDbFake, orderCommunicatorFake);

    await promoSend.act(30);

    expect(dispatchEmailSpy).toHaveBeenCalledTimes(1);
    expect(dispatchEmailSpy).toHaveBeenCalledWith(
      'noorder@example.com',
      'We miss you!',
      expect.stringContaining(`You haven't visited us for long time! Here is a promocode for you: `),
    );
  });

  it('should send promo codes to inactive users', async () => {
    const inactiveUser = { id: 2, email: 'inactive@example.com', name: 'Jane', last_name: 'Doe' };

    const now = new Date();
    const thirtyOneDaysAgo = new Date(now.setDate(now.getDate() - 31));
    const lastOrder: OrderRaw = {
      id: 101,
      userId: inactiveUser.id,
      products: [],
      price: 100,
      status: 'completed',
      updatedAt: thirtyOneDaysAgo,
    };

    const userDbFake = new UserDbInMemoryFake({ users: [inactiveUser] });
    const orderCommunicatorFake = new OrderCommunicatorFake({
      stubs: {
        getLastByUserId: () => Promise.resolve(lastOrder),
      },
    });
    const promoSend = new PromoSend(userDbFake, orderCommunicatorFake);

    await promoSend.act(30);

    expect(dispatchEmailSpy).toHaveBeenCalledTimes(1);
    expect(dispatchEmailSpy).toHaveBeenCalledWith(
      'inactive@example.com',
      'We miss you!',
      expect.stringContaining(`You haven't visited us for long time! Here is a promocode for you: `),
    );
  });

  it('should not send promo codes to active users', async () => {
    const activeUser = { id: 3, email: 'active@example.com', name: 'Peter', last_name: 'Pan' };

    const now = new Date();
    const tenDaysAgo = new Date(now.setDate(now.getDate() - 10));
    const lastOrder: OrderRaw = {
      id: 102,
      userId: activeUser.id,
      products: [],
      price: 50,
      status: 'completed',
      updatedAt: tenDaysAgo,
    };

    const userDbFake = new UserDbInMemoryFake({ users: [activeUser] });
    const orderCommunicatorFake = new OrderCommunicatorFake({
      stubs: {
        getLastByUserId: () => Promise.resolve(lastOrder),
      },
    });
    const promoSend = new PromoSend(userDbFake, orderCommunicatorFake);

    await promoSend.act(30);

    expect(dispatchEmailSpy).not.toHaveBeenCalled();
  });

  it('should generate a 4-character alphanumeric promocode', async () => {
    const user = { id: 4, email: 'test@example.com', name: 'Test', last_name: 'User' };
    const userDbFake = new UserDbInMemoryFake({ users: [user] });
    const orderCommunicatorFake = new OrderCommunicatorFake({
      stubs: {
        getLastByUserId: () => Promise.resolve(null),
      },
    });
    const promoSend = new PromoSend(userDbFake, orderCommunicatorFake);

    await promoSend.act(1);

    const callBody: string = dispatchEmailSpy.mock.calls[0][2];
    const promocodeMatch = callBody.match(/promocode for you: ([A-Z0-9]{4})/);

    expect(promocodeMatch).not.toBeNull();
    expect(promocodeMatch?.[1].length).toBe(4);
  });
});
