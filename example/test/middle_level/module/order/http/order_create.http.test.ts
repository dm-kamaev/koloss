import { orderCreate } from '@/module/order/http/order_create.http';
import { OrderCreate } from '@/module/order/action/order_create.action';
import { OrderDb } from '@/module/order/repository/order.db';
import { UserCommunicatorFake } from '@test/fake/module/user/user.communicator';
import { createApp } from '@/http';
import { AppError } from '@/core/error/app.error';
import { NotFound } from '@/core/error/not_found.error';
import { createClassStub, createMockClass } from '@/lib_test';
import { kafkaInstance } from '@/core/kafka/kafka_client.instance';
import { emailClientInstance } from '@/core/email/email_client.instance';
import { AppCommunicatorFake } from '@test/fake/communicator';
import { FastifyInstance } from 'fastify';
import { pgConnect } from '@/core/pg/pg.instance';
import { SchemaDB } from '@/core/pg/pg.type';
import { testTransaction } from 'pg-transactional-tests';
import { UserDbFake } from '@test/fake/module/user/repository/user.db';

describe('HTTP Order Create', () => {
  let app: FastifyInstance;
  const db: SchemaDB = pgConnect.create();

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

  it('should create an order and return 201', async () => {
    const products = [
      { name: 'Banana', amount: 4, price: 10 },
      { name: 'Milk', amount: 32, price: 20 },
    ];

    const userCommunicator = new AppCommunicatorFake().user;
    const orderDb = new OrderDb();
    const orderCreateAction = new OrderCreate(userCommunicator, orderDb);

    orderCreate({
      app,
      OrderCreate: createClassStub(OrderCreate).mockImplementation(() => orderCreateAction),
      userCommunicator,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/order',
      payload: {
        user_id: UserDbFake.defaultUser.id,
        products,
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();

    expect(body.id).toEqual(expect.any(Number));
    expect(body.price).toBe(680);
    expect(body.countProducts).toBe(36);
    expect(body.user.id).toBe(UserDbFake.defaultUser.id);
    expect(body.updatedAt).toBeDefined();

    const result = await db.selectFrom('orders').select(db.fn.countAll().as('count')).executeTakeFirstOrThrow();
    // 4 from init.sql + 1 created
    expect(Number(result.count)).toBe(5);

    expect(kafkaInstance.send).toHaveBeenCalledTimes(1);
    expect(emailClientInstance.dispatch).toHaveBeenCalledTimes(1);

    expect(kafkaInstance.send).toHaveBeenCalledWith('order_metrics', {
      key: String(body.id),
      value: JSON.stringify({
        id: body.id,
        price: body.price,
        countProducts: body.countProducts,
        createdAt: new Date(body.updatedAt),
      }),
    });

    expect(emailClientInstance.dispatch).toHaveBeenCalledWith(UserDbFake.defaultUser.email, expect.any(String), expect.any(String));
  });

  it('should return 404 if user is not found', async () => {
    const userId = 9999; // Non-existent user ID
    const products = [
      { name: 'Banana', amount: 4, price: 10 },
      { name: 'Milk', amount: 32, price: 20 },
    ];

    const UserCommunicatorCtorFake = createMockClass(UserCommunicatorFake, { existUserWithId: async (id) => id !== userId });
    const userCommunicator = new UserCommunicatorCtorFake(new AppCommunicatorFake().order);

    const orderDb = new OrderDb();
    const orderCreateAction = new OrderCreate(userCommunicator, orderDb);

    orderCreate({
      app,
      OrderCreate: createClassStub(OrderCreate).mockImplementation(() => orderCreateAction),
      userCommunicator,
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

    const result = await db.selectFrom('orders').select(db.fn.countAll().as('count')).executeTakeFirstOrThrow();
    expect(Number(result.count)).toBe(4); // 4 from init.sql
  });
});
