import crypto from 'node:crypto';

export class OrderRepository {
  private readonly orders: Array<{
    id: number;
    status: 'pending' | 'paid' | 'picking' | 'delivered' | 'completed' | 'cancelled';
    user_id: number;
    products: {
      list: Array<{ id: number; price: number; quantity: number; weight: number }>;
      total_price: number;
      total_weigth: number;
    };
  }> = [];

  getAll() {
    return this.orders;
  }
  getById(id: number) {
    return this.orders.find((el) => el.id === id);
  }

  create(order: Omit<OrderRepository['orders'][number], 'id' | 'status'>) {
    const id = crypto.randomInt(10000);
    this.orders.push({
      ...order,
      id,
      status: 'pending',
    });
    return { id };
  }
}
