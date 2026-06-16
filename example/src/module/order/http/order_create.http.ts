import type { FastifyInstance } from 'fastify';
import { OrderCreateCtor } from '@/module/order/action/order_create.action';
import { IUserCommunicator } from '@/communicator/user.communicator.type';
import { AfterOrderCreate } from '../decorator/after_order_create.decorator';
import { OrderCreateEmailNotify } from '../notification/order_create_email.notify';
import { OrderCreateMetric } from '../metric/order_create_metric.metric';
import { z } from 'zod';
import { UserExistGuard } from '../guard/user_exist.guard';

// DTO
const ProductSchema = z.object({
  name: z.string(),
  amount: z.number().int().positive(),
  price: z.number().positive(),
});

const OrderCreateInputBodyDto = z.object({
  user_id: z.number(),
  products: z.array(ProductSchema).min(1),
});

type OrderCreateBody = z.infer<typeof OrderCreateInputBodyDto>;

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
    const { user_id: userId, products } = await OrderCreateInputBodyDto.parseAsync(req.body);

    await new UserExistGuard(userCommunicator).act(userId);

    const order = await new AfterOrderCreate(new OrderCreate(userCommunicator), new OrderCreateEmailNotify(), new OrderCreateMetric()).act({
      userId,
      products,
    });

    const user = await order.getUser();

    try {
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
    } catch (error) {
      console.log('HERE', error);
    }
  });
}
