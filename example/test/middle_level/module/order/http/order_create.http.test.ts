import { orderCreateHttp } from '#/module/order/http/order_create.http';
import { OrderCreate } from '#/module/order/action/order_create.action';
import { UserCommunicatorFake } from '#test/fake/module/user/user.communicator';
import { createApp } from '#/http';
import { AppError } from '#/core/error/app.error';
import { NotFound } from '#/core/error/not_found.error';
import { createMockClass } from '#/lib';
import { kafkaInstance } from '#/core/kafka/kafka_client.instance';
import { emailClientInstance } from '#/core/email/email_client.instance';
import { AppCommunicatorFake } from '#test/fake/communicator';
import { FastifyInstance } from 'fastify';
import { pgConnect } from '#/core/pg/pg.instance';
import { testTransaction } from 'pg-transactional-tests';
import { OrderDbFake } from '#test/fake/module/order/repository/order.db.fake';

describe('HTTP Order Create', () => {
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

  it('should create an order and return 201', async () => {
    const products = [
      { name: 'Banana', amount: 4, price: 10 },
      { name: 'Milk', amount: 32, price: 20 },
    ];

    const orderDb = new OrderDbFake();

    const countBefore = Number(await orderDb.countAll());

    orderCreateHttp({
      app,
      OrderCreate,
      userCommunicator: new AppCommunicatorFake().user,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/order',
      payload: {
        user_id: 1234,
        products,
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();

    expect(body.id).toEqual(expect.any(Number));
    expect(body.price).toBe(680);
    expect(body.countProducts).toBe(36);
    expect(body.user.id).toBe(1234);
    expect(body.updatedAt).toBeDefined();

    const countAfter = Number(await orderDb.countAll());
    expect(countAfter).toBe(countBefore + 1);

    expect(kafkaInstance.send).toHaveBeenCalledTimes(1);
    expect(emailClientInstance.dispatch).toHaveBeenCalledTimes(1);

    expect(kafkaInstance.send).toHaveBeenCalledWith('order_metrics', {
      key: String(body.id),
      value: JSON.stringify({
        id: body.id,
        price: body.price,
        countProducts: body.countProducts,
        createdAt: new Date(body.updatedAt),
        userId: body.user.id,
      }),
    });

    expect(emailClientInstance.dispatch).toHaveBeenCalledWith('test@example.com', expect.any(String), expect.any(String));
  });

  it('should return 404 if user is not found', async () => {
    const userId = 9999; // Non-existent user ID
    const products = [
      { name: 'Banana', amount: 4, price: 10 },
      { name: 'Milk', amount: 32, price: 20 },
    ];

    const orderDb = new OrderDbFake();
    const countBefore = Number(await orderDb.countAll());

    const UserCommunicatorCtor = createMockClass(UserCommunicatorFake, { existUserWithId: async (id: number) => id !== userId });

    orderCreateHttp({
      app,
      OrderCreate,
      userCommunicator: new AppCommunicatorFake({ UserCommunicatorCtor }).user,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/order',
      payload: {
        user_id: userId,
        products,
      },
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body) as AppError;
    expect(body.code).toBe(new NotFound('').code);

    const countAfter = Number(await orderDb.countAll());
    expect(countAfter).toBe(countBefore);
  });
});
