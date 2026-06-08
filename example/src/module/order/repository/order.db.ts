import { Order, OrderWithPrice } from '../entity/order.entity';

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

const oneDayAgo = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago

// global store, emulation Database
const ORDERS: OrderRaw[] = [
  { id: 1, userId: 1234, products: [{ name: 'Apple', amount: 1, price: 10 }], status: 'completed', updatedAt: oneDayAgo, price: 10 },
  { id: 2, userId: 1234, products: [{ name: 'Orange', amount: 2, price: 20 }], status: 'pending', updatedAt: new Date(), price: 40 },
  { id: 3, userId: 2, products: [{ name: 'Banana', amount: 3, price: 5 }], status: 'completed', updatedAt: new Date(), price: 15 },
  { id: 4, userId: 1, products: [{ name: 'Milk', amount: 4, price: 15 }], status: 'archived', updatedAt: oneDayAgo, price: 60 },
];

export class OrderDb {
  constructor(protected readonly _orders = ORDERS) {}

  async getById(orderId: number): Promise<OrderRaw> {
    const order = this._orders.find(({ id }) => id === orderId);
    if (!order) {
      throw new Error(`Not found order with id: ${orderId}`);
    }
    return order;
  }

  async getCountByUserId(userId: number): Promise<number> {
    const userOrders = this._orders.filter((order) => order.userId === userId);
    return userOrders.length;
  }

  async create(orderData: { userId: number; products: OrderProductRaw[] }): Promise<OrderRaw> {
    const newId = this._orders.length > 0 ? Math.max(...this._orders.map((o) => o.id)) + 1 : 1;
    const order = new (OrderWithPrice(Order, orderData.products))(newId);

    const newOrder: OrderRaw = {
      id: newId,
      userId: orderData.userId,
      products: orderData.products,
      price: order.price,
      status: 'pending',
      updatedAt: new Date(),
    };

    this._orders.push(newOrder);

    return newOrder;
  }

  async findCompletedOlderThan(date: Date): Promise<OrderRaw[]> {
    const filteredOrders = this._orders.filter((order) => {
      return order.status === 'completed' && order.updatedAt < date;
    });
    return filteredOrders;
  }

  async archive(orderId: number): Promise<void> {
    console.log('HERE', orderId);
    const order = await this.getById(orderId);
    if (order) {
      order.status = 'archived';
      order.updatedAt = new Date();
    }
  }
}
