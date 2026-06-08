import { userGetById } from '@/module/user/http/user_get_by_id.http';
import { UserGetById } from '@/module/user/action/user_get_by_id.action';
import { UserDbFake } from '@test/fake/module/user/repository/user.db';
import { createClassStub, createMockClass } from '@/lib_test';
import { createApp } from '@/http';
import { OrderCommunicatorFake } from '@test/fake/module/order/order.communicator';
import { AppCommunicatorFake } from '@test/fake/communicator';

describe('HTTP User Get By Id', () => {
  it('should return user information and status 200', async () => {
    const app = createApp();
    const orderCount = 5;

    const userDb = new UserDbFake();

    const OrderCommunicatorCtorFake = createMockClass(OrderCommunicatorFake, { getCountUserOrders: async (_) => orderCount });
    const orderCommunicator = new OrderCommunicatorCtorFake(new AppCommunicatorFake().user);
    const userGetByIdAction = new UserGetById(orderCommunicator, userDb);

    userGetById({
      app,
      UserGetById: createClassStub(UserGetById).mockImplementation(() => userGetByIdAction),
      orderCommunicator,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/user/${UserDbFake.defaultUser.id}`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    const { email } = await userDb.getById(UserDbFake.defaultUser.id);

    expect(body.id).toBe(UserDbFake.defaultUser.id);
    expect(body.email).toBe(email);
    expect(body.ordersCount).toBe(orderCount);
  });
});
