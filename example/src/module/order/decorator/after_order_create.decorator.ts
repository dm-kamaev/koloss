import { OrderCreate } from '../action/order_create.action.js';
import { OrderProductRaw } from '../repository/order.db.js';
import { OrderCreateEmailNotify } from '../notification/order_create_email.notify.js';
import { OrderCreateMetric } from '../metric/order_create_metric.metric.js';

export class AfterOrderCreate {
  constructor(
    private readonly orderCreate: OrderCreate,
    private readonly orderCreateEmailNotify: OrderCreateEmailNotify,
    private readonly orderCreateMetric: OrderCreateMetric,
  ) {}

  async act(orderData: { userId: number; products: OrderProductRaw[] }) {
    const order = await this.orderCreate.act(orderData);
    const user = await order.getUser();

    await Promise.all([
      this.orderCreateEmailNotify.act({
        email: user.email,
        data: {
          id: order.id,
          price: order.price,
          createdAt: order.updatedAt,
        },
      }),
      this.orderCreateMetric.act({
        id: order.id,
        countProducts: order.countProducts,
        price: order.price,
        createdAt: order.updatedAt,
        userId: user.id,
      }),
    ]);

    return order;
  }
}
