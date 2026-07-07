import { pgConnect } from '#/core/pg/pg.instance';
import { OrdersTable, SchemaDB } from '#/core/pg/pg.type';
import { Order, OrderWithPrice } from '../entity/order.entity.js';
import { Selectable } from 'kysely';

export interface OrderProductRaw {
  name: string;
  amount: number;
  price: number;
}

export interface OrderRaw {
  id: number;
  userId: number;
  products: OrderProductRaw[];
  price: number;
  status: 'pending' | 'completed' | 'archived';
  updatedAt: Date;
}

type OrderSelectable = Selectable<OrdersTable>;

function fromDb(order: OrderSelectable): OrderRaw {
  return {
    id: order.id,
    userId: order.user_id,
    products: order.products,
    price: Number(order.price),
    status: order.status,
    updatedAt: order.updated_at,
  };
}

export class OrderDb {
  protected readonly db: SchemaDB;

  constructor() {
    this.db = pgConnect.create();
  }

  async getById(orderId: number): Promise<OrderRaw> {
    const order = await this.db.selectFrom('orders').selectAll().where('id', '=', orderId).executeTakeFirst();

    if (!order) {
      throw new Error(`Not found order with id: ${orderId}`);
    }
    return fromDb(order);
  }

  async getLastByUserId(userId: number): Promise<OrderRaw | undefined> {
    const order = await this.db
      .selectFrom('orders')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('updated_at', 'desc')
      .executeTakeFirst();

    if (!order) {
      return undefined;
    }

    return fromDb(order);
  }

  async getCountByUserId(userId: number): Promise<number> {
    const result = await this.db
      .selectFrom('orders')
      .select(({ fn }) => [fn.count<string>('id').as('count')])
      .where('user_id', '=', userId)
      .executeTakeFirst();

    return Number(result?.count ?? 0);
  }

  async getCountUserOrdersWithPriceAbove(userId: number, minPrice: number): Promise<number> {
    const result = await this.db
      .selectFrom('orders')
      .select(({ fn }) => [fn.count<string>('id').as('count')])
      .where('user_id', '=', userId)
      .where('price', '>', minPrice)
      .executeTakeFirst();

    return Number(result?.count ?? 0);
  }

  async create(orderData: { userId: number; products: OrderProductRaw[] }): Promise<OrderRaw> {
    const order = new (OrderWithPrice(Order, orderData.products))(0); // temp id for price calculation

    const newOrder = await this.db
      .insertInto('orders')
      .values({
        user_id: orderData.userId,
        products: JSON.stringify(orderData.products),
        price: order.price,
        status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return fromDb(newOrder);
  }

  async findCompletedOlderThan(date: Date): Promise<OrderRaw[]> {
    const orders = await this.db
      .selectFrom('orders')
      .selectAll()
      .where('status', '=', 'completed')
      .where('updated_at', '<', date)
      .execute();

    return orders.map(fromDb);
  }

  async archive(orderId: number): Promise<void> {
    await this.db
      .updateTable('orders')
      .set({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', orderId)
      .execute();
  }
}
