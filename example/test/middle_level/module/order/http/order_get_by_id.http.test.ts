import { orderGetByIdHttp } from '@/module/order/http/order_get_by_id.http';
import { OrderGetById } from '@/module/order/action/order_get_by_id.action';
import { createApp } from '@/http';
import { AppCommunicatorFake } from '@test/fake/communicator';
import { FastifyInstance } from 'fastify';
import { pgConnect } from '@/core/pg/pg.instance';
import { UserDbInMemoryFake } from '@test/fake/module/user/repository/user.db.fake.in_memory';
import { OrderDbFake } from '@test/fake/module/order/repository/order.db.fake';

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
    orderGetByIdHttp({
      app,
      OrderGetById,
      userCommunicator: new AppCommunicatorFake().user,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/order/${OrderDbFake.defaultOrder.id}`,
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.id).toBe(OrderDbFake.defaultOrder.id);
    expect(body.user.id).toEqual(UserDbInMemoryFake.defaultUser.id);
  });
});
