import { OrderDb, OrderRaw } from '@/module/order/repository/order.db';
import { UserDbInMemoryFake } from '../../user/repository/user.db.fake.in_memory';

export class OrderDbFake extends OrderDb {
  // TODO: load from db before start test
  static readonly defaultOrder: OrderRaw = {
    id: 1,
    userId: UserDbInMemoryFake.defaultUser.id,
    products: [{ name: 'Apple', amount: 1, price: 10 }],
    price: 10,
    status: 'completed',
    updatedAt: new Date(),
  };

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

  constructor() {
    super();
  }
}
