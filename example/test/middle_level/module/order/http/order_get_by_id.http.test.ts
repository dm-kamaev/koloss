import { orderGetById } from '@/module/order/http/order_get_by_id.http';
import { OrderGetById } from '@/module/order/action/order_get_by_id.action';
import { OrderDbFake } from '@test/fake/module/order/repository/order.db';
import { createApp } from '@/http';
import { UserDbFake } from '@test/fake/module/user/repository/user.db';
import { createClassStub } from '@/lib_test';
import { AppCommunicatorFake } from '@test/fake/communicator';

describe('HTTP Order Get By Id', () => {
  beforeEach(async () => {
    await new OrderDbFake().deleteAll();
  });

  it('should return an order with user information and status 200', async () => {
    const app = createApp();

    const orderDb = new OrderDbFake();
    const orderId = await orderDb.insertDefault();

    const userCommunicator = new AppCommunicatorFake().user;
    const orderGetByIdAction = new OrderGetById(userCommunicator, orderDb);

    orderGetById({
      app,
      OrderGetById: createClassStub(OrderGetById).mockImplementation(() => orderGetByIdAction),
      userCommunicator,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/order/${orderId}`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    expect(body.id).toBe(orderId);
    expect(body.user.id).toEqual(UserDbFake.defaultUser.id);
  });
});
