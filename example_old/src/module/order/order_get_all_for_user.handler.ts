import type { OrderRepository } from './db/order.repository';

export class OrderGetAllForUserHandler {
  constructor(private readonly orderRepository: OrderRepository) {}

  async exec(user_id: number) {
    return this.orderRepository.getAll().filter((el) => el.user_id === user_id);
  }
}
