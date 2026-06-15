import { OrderDb, OrderRaw } from '@/module/order/repository/order.db';
import { UserDbFake } from '../../user/repository/user.db';

export class OrderDbFake extends OrderDb {
  private _orders: OrderRaw[] = [];
  private _nextId = 1;

  static readonly defaultOrder: OrderRaw = {
    id: 1,
    userId: UserDbFake.defaultUser.id,
    products: [{ name: 'Apple', amount: 1, price: 10 }],
    price: 10,
    status: 'completed',
    updatedAt: new Date(),
  };

  constructor(orders: OrderRaw[] = []) {
    super();
    this._orders = orders;
  }

  insertDefault() {
    this._orders.push(OrderDbFake.defaultOrder);
    return (OrderDbFake.defaultOrder.id = this._orders.at(-1)!.id);
  }

  deleteAll() {
    this._orders.length = 0;
    this._nextId = 1;
  }

  countAll() {
    return this._orders.length;
  }

  async getCountByUserId(userId: number): Promise<number> {
    return this._orders.filter((o) => o.userId === userId).length;
  }

  async create(orderData: {
    userId: number;
    products: import('@/module/order/repository/order.db').OrderProductRaw[];
  }): Promise<import('@/module/order/repository/order.db').OrderRaw> {
    const newOrder: import('@/module/order/repository/order.db').OrderRaw = {
      id: this._nextId++,
      userId: orderData.userId,
      products: orderData.products,
      price: orderData.products.reduce((acc, p) => acc + p.price * p.amount, 0),
      status: 'pending',
      updatedAt: new Date(),
    };
    this._orders.push(newOrder);
    return newOrder;
  }

  async getById(orderId: number): Promise<import('@/module/order/repository/order.db').OrderRaw> {
    const order = this._orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error(`Not found order with id: ${orderId}`);
    }
    return order;
  }

  async findCompletedOlderThan(date: Date): Promise<import('@/module/order/repository/order.db').OrderRaw[]> {
    return this._orders.filter((o) => o.status === 'completed' && o.updatedAt < date);
  }

  async archive(orderId: number): Promise<void> {
    const order = this._orders.find((o) => o.id === orderId);
    if (order) {
      order.status = 'archived';
      order.updatedAt = new Date();
    }
  }
}
