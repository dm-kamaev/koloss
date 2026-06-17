import { orderGetByIdHttp } from '@/module/order/http/order_get_by_id.http';
import { OrderGetById } from '@/module/order/action/order_get_by_id.action';
import { createApp } from '@/http';
import { AppCommunicatorFake } from '@test/fake/communicator';
import { FastifyInstance } from 'fastify';
import { pgConnect } from '@/core/pg/pg.instance';
import { testTransaction } from 'pg-transactional-tests';
import { UserDbFake } from '@test/fake/module/user/repository/user.db fake';

describe('HTTP Order Get By Id', () => {
  let app: FastifyInstance;
  const db = pgConnect.create();

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
    await db.destroy();
  });

  it('should return an order with user information and status 200', async () => {
    const userId = UserDbFake.defaultUser.id;

    const orderResult = await db
      .insertInto('orders')
      .values({
        user_id: userId,
        products: JSON.stringify([{ name: 'Apple', amount: 1, price: 10 }]),
        price: 10,
        status: 'pending',
        updated_at: new Date() as any,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    const orderId = orderResult.id;

    orderGetByIdHttp({
      app,
      OrderGetById,
      userCommunicator: new AppCommunicatorFake().user,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/order/${orderId}`,
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.id).toBe(orderId);
    expect(body.user.id).toEqual(userId);
  });
});
