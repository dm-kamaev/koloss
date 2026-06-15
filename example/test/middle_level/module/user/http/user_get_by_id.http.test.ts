// import { testTransaction } from 'pg-transactional-tests';
import { userGetById } from '@/module/user/http/user_get_by_id.http';
import { UserGetById } from '@/module/user/action/user_get_by_id.action';
import { UserDb } from '@/module/user/repository/user.db';
import { createClassStub } from '@/lib_test';
import { createApp } from '@/http';
import { OrderCommunicator } from '@/module/order/order.communicator';
import { AppCommunicator } from '@/communicator';
import { SchemaDB } from '@/core/pg/pg.type';
import { pgConnect } from '@/core/pg/pg.instance';
import { FastifyInstance } from 'fastify';
import { UserDbFake } from '@test/fake/module/user/repository/user.db';

describe('HTTP User Get By Id', () => {
  let app: FastifyInstance;

  const db: SchemaDB = pgConnect.create();

  beforeEach(async () => {
    app = createApp();
    // await pgConnect.rebuild();
    // await testTransaction.start();
  });

  afterEach(async () => {
    app.close();
    // await testTransaction.rollback();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should return user information and status 200', async () => {
    const userDb = new UserDb();

    const appCommunicator = new AppCommunicator();
    const orderCommunicator = new OrderCommunicator(appCommunicator.user);
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

    expect(body.id).toBe(UserDbFake.defaultUser.id);
    expect(body.email).toBe(UserDbFake.defaultUser.email);
    expect(body.ordersCount).toBe(2);
  });
});
