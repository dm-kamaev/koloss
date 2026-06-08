import { OrdersCountOfUser } from '@/module/order/action/orders_count_of_user.action';
import { OrderDbFake } from '../../../../fake/module/order/repository/order.db';

describe('OrdersCountOfUser', () => {
  it('should return the number of orders for a given user', async () => {
    const userId = 1234;

    const orderDb = new OrderDbFake([
      { id: 1, userId, updatedAt: new Date(), products: [{ name: 'Banana', amount: 12, price: 14 }], price: 1234, status: 'pending' },
    ]);
    const count = await new OrdersCountOfUser(orderDb).act({ userId });

    expect(count).toBe(1);
  });
});
