import { PromoCodeCreateToUsersDidntMakeOrderForTooLong } from '@/module/user/action/promocode_create_to_users_didnt_make_order_for_too_long.action';
import { UserDbInMemoryFake } from '@test/fake/module/user/repository/user.db.in_memory.fake';
import { OrderCommunicatorFake } from '@test/fake/module/order/order.communicator';
import { OrderRaw } from '@/module/order/repository/order.db';
import { AppCommunicatorFake } from '@test/fake/communicator';
import { UserPromoCode } from '@/module/user/entity/user_promocode.entity';
import { emailClientInstance } from '@/core/email/email_client.instance';

describe('PromoCodeCreateToUsersDidntMakeOrderForTooLong', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create promocodes for users with no orders', async () => {
    const userWithoutOrders = { id: 1, email: 'noorder@example.com', name: 'John', last_name: 'Doe' };
    const userDbFake = new UserDbInMemoryFake({ users: [userWithoutOrders] });
    const orderCommunicatorFake = new OrderCommunicatorFake(new AppCommunicatorFake().user, {
      stubs: {
        findLastOrderByUserId: () => Promise.resolve(undefined),
      },
    });
    const action = new PromoCodeCreateToUsersDidntMakeOrderForTooLong(orderCommunicatorFake, userDbFake);

    const result = await action.act(30);

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(UserPromoCode);
  });

  it('should create promocodes for inactive users', async () => {
    const inactiveUser = { id: 2, email: 'inactive@example.com', name: 'Jane', last_name: 'Doe' };
    const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    const lastOrder: OrderRaw = {
      id: 101,
      userId: inactiveUser.id,
      products: [],
      price: 100,
      status: 'completed',
      updatedAt: thirtyOneDaysAgo,
    };

    const userDbFake = new UserDbInMemoryFake({ users: [inactiveUser] });
    const orderCommunicatorFake = new OrderCommunicatorFake(new AppCommunicatorFake().user, {
      stubs: {
        findLastOrderByUserId: () => Promise.resolve(lastOrder),
      },
    });
    const action = new PromoCodeCreateToUsersDidntMakeOrderForTooLong(orderCommunicatorFake, userDbFake);

    const result = await action.act(30);

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(UserPromoCode);
  });

  it('should not create promocodes for active users', async () => {
    const activeUser = { id: 3, email: 'active@example.com', name: 'Peter', last_name: 'Pan' };
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const lastOrder: OrderRaw = {
      id: 102,
      userId: activeUser.id,
      products: [],
      price: 50,
      status: 'completed',
      updatedAt: tenDaysAgo,
    };

    const userDbFake = new UserDbInMemoryFake({ users: [activeUser] });
    const orderCommunicatorFake = new OrderCommunicatorFake(new AppCommunicatorFake().user, {
      stubs: {
        findLastOrderByUserId: () => Promise.resolve(lastOrder),
      },
    });
    const action = new PromoCodeCreateToUsersDidntMakeOrderForTooLong(orderCommunicatorFake, userDbFake);

    const result = await action.act(30);

    expect(result).toHaveLength(0);
  });

  it('should generate a 4-character alphanumeric promocode', async () => {
    const user = { id: 4, email: 'test@example.com', name: 'Test', last_name: 'User' };
    const userDbFake = new UserDbInMemoryFake({ users: [user] });
    const orderCommunicatorFake = new OrderCommunicatorFake(new AppCommunicatorFake().user, {
      stubs: {
        findLastOrderByUserId: () => Promise.resolve(undefined),
      },
    });
    const action = new PromoCodeCreateToUsersDidntMakeOrderForTooLong(orderCommunicatorFake, userDbFake);

    const result = await action.act(1);
    const promocode = result[0];

    const dispatchSpy = jest.spyOn(emailClientInstance, 'dispatch').mockReturnValue(undefined);
    await promocode.sendToUserViaEmail({
      subject: 'We miss you!',
      body: (code: string) => `Here is a promocode for you: ${code}`,
    });

    const callBody: string = dispatchSpy.mock.calls[0][2];
    const promocodeMatch = callBody.match(/promocode for you: ([A-Z0-9]{4})/);

    expect(promocodeMatch).not.toBeNull();
    expect(promocodeMatch?.[1].length).toBe(4);
  });
});
