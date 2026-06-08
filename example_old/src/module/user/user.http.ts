import type { FastifyInstance } from 'fastify';

import type { UserCreateHandler } from './user_create.handler';
import type { UserGetByIdHandler } from './user_get_by_id.handler';

export function mountUserRoutes({
  app,
  userGetByIdHandler,
  userCreateHandler,
}: {
  app: FastifyInstance;
  userGetByIdHandler: UserGetByIdHandler;
  userCreateHandler: UserCreateHandler;
}) {
  /*
  curl -X POST http://127.0.0.1:4005/user  -H "Content-Type: application/json" \
    -d '{ "first_name": "Ivan", "last_name": "Ivanov"}'
  */
  app.post<{
    Body: {
      first_name: string;
      last_name: string;
    };
  }>('/user', async function handler(req, reply) {
    const userInput = req.body;
    const user = await userCreateHandler.exec(userInput);
    reply.status(200).send({ id: user.id });
  });

  // curl -X GET http://127.0.0.1:4005/order
  app.get<{
    Params: {
      user_id: number;
    };
  }>('/user/:user_id', async function handler(req, reply) {
    const user_id = parseFloat(req.params.user_id as unknown as string);
    const user = await userGetByIdHandler.exec(user_id);
    reply.status(200).send(user);
  });
}
