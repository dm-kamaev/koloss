import { OrderDb, OrderRaw } from '@/module/order/repository/order.db';
import { UserDbFake } from '../../user/repository/user.db';

export class OrderDbFake extends OrderDb {
  static readonly defaultOrder: OrderRaw = {
    id: 349535,
    userId: UserDbFake.defaultUser.id,
    products: [{ name: 'Test Product', amount: 1, price: 100 }],
    price: 100,
    status: 'pending',
    updatedAt: new Date(),
  };

  constructor(orders: OrderRaw[] = []) {
    super(orders);
  }

  insertDefault() {
    this._orders.push(OrderDbFake.defaultOrder);
    return (OrderDbFake.defaultOrder.id = this._orders.at(-1)!.id);
  }

  countAll() {
    return this._orders.length;
  }

  deleteAll() {
    this._orders.length = 0;
  }
}
