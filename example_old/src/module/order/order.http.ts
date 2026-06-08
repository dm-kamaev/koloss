import type { FastifyInstance } from 'fastify';

import type { OrderGetAllHandler } from './order_get_all.handler';
import type { OrderCreateHandler } from './order_сreate.handler';

export function mountOrderRoutes({
  app,
  orderGetAllHandler,
  orderCreateHandler,
}: {
  app: FastifyInstance;
  orderGetAllHandler: OrderGetAllHandler;
  orderCreateHandler: OrderCreateHandler;
}) {
  /*
  curl -X POST http://127.0.0.1:4005/order  -H "Content-Type: application/json" \
    -d '{ "user_id": 1, "products": [{"id": 1, "price": 2.80, "quantity": 5, "weight": 2.25},{"id": 12, "price": 102.5, "quantity": 5, "weight": 0.3}]}'
  */
  app.post<{
    Body: {
      products: Array<{ id: number; price: number; quantity: number; weight: number }>;
      user_id: number;
    };
  }>('/order', async function handler(req, reply) {
    const orderInput = req.body;
    const order = await orderCreateHandler.exec(orderInput);
    reply.status(200).send({ id: order.id });
  });

  // // curl -X GET http://127.0.0.1:4005/order/4980
  // app.get<{
  //   Params: {
  //     id: string;
  //   };
  // }>('/order/:id', async function handler(req, reply) {
  //   const id = parseInt(req.params.id, 10);
  //   const order = await provider.order.getById(id);
  //   reply.status(200).send(order);
  // });

  // curl -X GET http://127.0.0.1:4005/order
  app.get<{
    // Params: {};
  }>('/order', async function handler(req, reply) {
    const orders = await orderGetAllHandler.exec();
    reply.status(200).send(orders);
  });
}
