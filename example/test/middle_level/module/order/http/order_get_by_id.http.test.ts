import { orderGetByIdHttp } from '#/module/order/http/order_get_by_id.http';
import { OrderGetById } from '#/module/order/action/order_get_by_id.action';
import { createApp } from '#/http';
import { AppCommunicatorFake } from '#test/fake/communicator';
import { FastifyInstance } from 'fastify';
import { pgConnect } from '#/core/pg/pg.instance';
import { testTransaction } from 'pg-transactional-tests';
import { OrderDbFake } from '#test/fake/module/order/repository/order.db.fake';

describe('HTTP Order Get By Id', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = createApp();
    await pgConnect.rebuild();
    await testTransaction.start();
  });

  afterEach(async () => {
    app.close();
    await testTransaction.rollback();
  });

  afterAll(async () => {
    await pgConnect.destroy();
  });

  it('should return an order with user information and status 200', async () => {
    const order = await new OrderDbFake().create({
      userId: 1234,
      products: [{ name: 'Apple', amount: 1, price: 10 }],
    });

    orderGetByIdHttp({
      app,
      OrderGetById,
      userCommunicator: new AppCommunicatorFake().user,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/order/${order.id}`,
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.id).toBe(order.id);
    expect(body.user.id).toBe(1234);
  });
});
