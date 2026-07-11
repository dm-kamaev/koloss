import type { FastifyInstance } from 'fastify';
import { OrderCreateCtor } from '#/module/order/action/order_create.action';
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { AfterOrderCreate } from '../decorator/after_order_create.decorator';
import { OrderCreateEmailNotify } from '../notification/order_create_email.notify';
import { OrderCreateMetric } from '../metric/order_create_metric.metric';
import { UserExistGuard } from '../guard/user_exist.guard';
import { OrderCreateInputBodyDto, OrderCreateBody } from '../dto/order_create_input.dto';

export function orderCreateHttp({
  app,
  OrderCreate,
  userCommunicator,
}: {
  app: FastifyInstance;
  OrderCreate: OrderCreateCtor;
  userCommunicator: IUserCommunicator;
}) {
  app.post<{
    Body: OrderCreateBody;
  }>('/order', async function handler(req, reply) {
    const { user_id: userId, products } = await new OrderCreateInputBodyDto().act(req.body);

    await new UserExistGuard(userCommunicator).act(userId);

    const order = await new AfterOrderCreate(new OrderCreate(userCommunicator), new OrderCreateEmailNotify(), new OrderCreateMetric()).act({
      userId,
      products,
    });

    const user = await order.getUser();

    reply.status(201).send({
      id: order.id,
      price: order.price,
      countProducts: order.countProducts,
      updatedAt: order.updatedAt,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  });
}
