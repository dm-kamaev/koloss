import { orderGetById } from '@/module/order/http/order_get_by_id.http';
import { OrderGetById } from '@/module/order/action/order_get_by_id.action';
import { OrderDb } from '@/module/order/repository/order.db';
import { createApp } from '@/http';
import { createClassStub } from '@/lib_test';
import { AppCommunicatorFake } from '@test/fake/communicator';
import { FastifyInstance } from 'fastify';
import { pgConnect } from '@/core/pg/pg.instance';
import { UserDbFake } from '@test/fake/module/user/repository/user.db';
import { OrderDbFake } from '@test/fake/module/order/repository/order.db';

describe('HTTP Order Get By Id', () => {
  let app: FastifyInstance;
  const db = pgConnect.create();

  beforeEach(async () => {
    app = createApp();
  });

  afterEach(async () => {
    app.close();
    await db.destroy();
  });

  it('should return an order with user information and status 200', async () => {
    const app = createApp();

    const orderDb = new OrderDb();

    const userCommunicator = new AppCommunicatorFake().user;
    const orderGetByIdAction = new OrderGetById(userCommunicator, orderDb);

    orderGetById({
      app,
      OrderGetById: createClassStub(OrderGetById).mockImplementation(() => orderGetByIdAction),
      userCommunicator,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/order/${OrderDbFake.defaultOrder.id}`,
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.id).toBe(OrderDbFake.defaultOrder.id);
    expect(body.user.id).toEqual(UserDbFake.defaultUser.id);
  });
});
