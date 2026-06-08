import type { OrderRepository } from './db/order.repository';

export class OrderCreateHandler {
  constructor(private readonly orderRepository: OrderRepository) {}

  async exec({
    user_id,
    products,
  }: {
    user_id: number;
    products: Pick<Parameters<OrderRepository['create']>[0], 'products'>['products']['list'];
  }) {
    let total_weigth = 0;
    let total_price = 0;

    products.forEach((el) => {
      total_weigth += el.weight * el.quantity;
      total_price += el.price * el.quantity;
    });

    const order = {
      user_id,
      products: {
        list: products,
        total_weigth,
        total_price,
      },
    };
    return this.orderRepository.create(order);
  }
}
