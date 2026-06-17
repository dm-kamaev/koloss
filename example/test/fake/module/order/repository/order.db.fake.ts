import { OrderDb, OrderRaw, OrderProductRaw } from '@/module/order/repository/order.db';
import { UserDbInMemoryFake } from '../../user/repository/user.db.in_memory.fake';
import { OrderStatus } from '@/core/pg/pg.type';
import { OrderDbInMemoryFake } from './order.db.in_memory.fake';

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
    return OrderDbInMemoryFake.generate(data);
  }

  constructor() {
    super();
  }

  async countAll() {
    const result = await this.db.selectFrom('orders').select(this.db.fn.countAll().as('count')).executeTakeFirstOrThrow();
    return result.count;
  }

  async add(data: OrderRaw): Promise<OrderRaw> {
    const row = await this.db
      .insertInto('orders')
      .values({
        id: data.id,
        user_id: data.userId,
        products: JSON.stringify(data.products),
        price: data.price,
        status: data.status,
        updated_at: data.updatedAt,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return {
      id: row.id,
      userId: row.user_id,
      products: row.products,
      price: Number(row.price),
      status: row.status,
      updatedAt: row.updated_at,
    };
  }

  async insert(data: {
    userId: number;
    products: OrderProductRaw[];
    price: number;
    status: OrderStatus;
    updatedAt: Date;
  }): Promise<OrderRaw> {
    const row = await this.db
      .insertInto('orders')
      .values({
        user_id: data.userId,
        products: JSON.stringify(data.products),
        price: data.price,
        status: data.status,
        updated_at: data.updatedAt,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return {
      id: row.id,
      userId: row.user_id,
      products: row.products,
      price: Number(row.price),
      status: row.status,
      updatedAt: row.updated_at,
    };
  }
}
