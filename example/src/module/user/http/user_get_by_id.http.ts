import type { FastifyInstance } from 'fastify';
import { IOrderCommunicator } from '@/communicator/order.communicator.type';
import { UserGetByIdCtor } from '../action/user_get_by_id.action';

export function userGetById({
  app,
  UserGetById,
  orderCommunicator,
}: {
  app: FastifyInstance;
  UserGetById: UserGetByIdCtor;
  orderCommunicator: IOrderCommunicator;
}) {
  // curl -X GET http://127.0.0.1:4005/user/1
  app.get<{
    Params: {
      user_id: string;
    };
  }>('/user/:user_id', async function handler(req, reply) {
    const userId = parseInt(req.params.user_id, 10);

    const result = await new UserGetById(orderCommunicator).act({ userId });

    reply.status(200).send({
      id: result.id,
      email: result.email,
      ordersCount: result.orderCounts,
    });
  });
}
