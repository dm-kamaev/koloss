import { OrderDb, OrderRaw, OrderProductRaw } from '#/module/order/repository/order.db';
import { UserDbInMemoryFake } from '../../user/repository/user.db.in_memory.fake.js';
import { Order, OrderWithPrice } from '#/module/order/entity/order.entity';
import { overridePropsOfObject, StubPropOfInstance } from '#/lib_test';

export class OrderDbInMemoryFake extends OrderDb {
  static readonly defaultOrder: OrderRaw = {
    id: 1,
    userId: UserDbInMemoryFake.defaultUser.id,
    products: [{ name: 'Apple', amount: 1, price: 10 }],
    price: 10,
    status: 'completed',
    updatedAt: new Date(),
  };

  private _orders: OrderRaw[] = [OrderDbInMemoryFake.defaultOrder];

  static generate(data?: Partial<OrderRaw>): OrderRaw {
    const defaultOrder: OrderRaw = {
      id: Math.floor(Math.random() * 1000) + 1, // Generate a random ID for uniqueness in tests
      userId: UserDbInMemoryFake.defaultUser.id,
      products: [{ name: 'Test Product', amount: 1, price: 100 }],
      price: 100,
      status: 'completed',
      updatedAt: new Date(),
    };

    return { ...defaultOrder, ...data };
  }

  constructor({ stubs, orders }: { stubs?: StubPropOfInstance<typeof OrderDbInMemoryFake>; orders?: OrderRaw[] } = {}) {
    super();

    this._orders = orders ?? [OrderDbInMemoryFake.defaultOrder];

    overridePropsOfObject(this, stubs || {});
  }

  async findLastOrderByUserId(userId: number): Promise<OrderRaw | undefined> {
    const userOrders = this._orders.filter((o) => o.userId === userId);
    if (userOrders.length === 0) {
      return undefined;
    }
    return userOrders.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
  }

  async getLastByUserId(userId: number): Promise<OrderRaw | undefined> {
    return this.findLastOrderByUserId(userId);
  }

  async getCountByUserId(userId: number): Promise<number> {
    return this._orders.filter((o) => o.userId === userId).length;
  }

  async create(orderData: { userId: number; products: OrderProductRaw[] }): Promise<OrderRaw> {
    const order = new (OrderWithPrice(Order, orderData.products))(0); // temp id for price calculation

    const newOrder: OrderRaw = {
      id: 1,
      userId: orderData.userId,
      products: orderData.products,
      price: order.price,
      status: 'pending',
      updatedAt: new Date(),
    };
    this._orders.push(newOrder);

    return newOrder;
  }

  async getById(orderId: number): Promise<OrderRaw> {
    const order = this._orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error(`Not found order with id: ${orderId}`);
    }
    return order;
  }
}
