// import { testTransaction } from 'pg-transactional-tests';
import { userGetByIdHttp } from '@/module/user/http/user_get_by_id.http';
import { UserGetById } from '@/module/user/action/user_get_by_id.action';
import { createApp } from '@/http';
import { AppCommunicator } from '@/communicator';
import { pgConnect } from '@/core/pg/pg.instance';
import { FastifyInstance } from 'fastify';
import { UserDbInMemoryFake } from '@test/fake/module/user/repository/user.db.in_memory.fake';
import { UserDbFake } from '@test/fake/module/user/repository/user.db fake';

describe('HTTP User Get By Id', () => {
  let app: FastifyInstance;

  const db = pgConnect.create();

  beforeEach(async () => {
    app = createApp();
  });

  afterEach(async () => {
    app.close();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should return user information and status 200', async () => {
    userGetByIdHttp({
      app,
      UserGetById,
      orderCommunicator: new AppCommunicator().order,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/user/${UserDbFake.defaultUser.id}`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    expect(body.id).toBe(UserDbInMemoryFake.defaultUser.id);
    expect(body.email).toBe(UserDbInMemoryFake.defaultUser.email);
    expect(body.ordersCount).toBe(0);
  });
});
