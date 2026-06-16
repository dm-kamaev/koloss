import type { FastifyInstance } from 'fastify';
import { IUserCommunicator } from '@/communicator/user.communicator.type';
import { OrderGetByIdCtor } from '@/module/order/action/order_get_by_id.action';

export function orderGetByIdHttp({
  app,
  OrderGetById,
  userCommunicator,
}: {
  app: FastifyInstance;
  OrderGetById: OrderGetByIdCtor;
  userCommunicator: IUserCommunicator;
}) {
  // curl -X GET http://127.0.0.1:4005/order/1
  app.get<{
    Params: {
      order_id: string;
    };
  }>('/order/:order_id', async function handler(req, reply) {
    const orderId = parseFloat(req.params.order_id);

    const result = await new OrderGetById(userCommunicator).act({ orderId });

    reply.status(200).send(result);
  });
}
