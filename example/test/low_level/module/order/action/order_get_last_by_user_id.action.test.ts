import { OrderGetLastByUserId } from '@/module/order/action/order_get_last_by_user_id.action';
import { OrderDbInMemoryFake } from '@test/fake/module/order/repository/order.db.in_memory.fake';
import { UserDbInMemoryFake } from '@test/fake/module/user/repository/user.db.in_memory.fake';
import { OrderRaw } from '@/module/order/repository/order.db';

describe('OrderGetLastByUserId', () => {
  const userId = UserDbInMemoryFake.defaultUser.id;

  it('should return last order by user id', async () => {
    const order1: OrderRaw = { id: 1, userId, products: [], price: 0, status: 'pending', updatedAt: new Date() };
    const order2: OrderRaw = { id: 2, userId, products: [], price: 0, status: 'pending', updatedAt: new Date(Date.now() + 100) };
    const orderDb = new OrderDbInMemoryFake({ orders: [order1, order2] });
    const action = new OrderGetLastByUserId(orderDb);

    const lastOrder = await action.act(userId);
    expect(lastOrder?.id).toBe(order2.id);
  });

  it('should return undefined if user has no orders', async () => {
    const orderDb = new OrderDbInMemoryFake({ orders: [] });
    const action = new OrderGetLastByUserId(orderDb);
    const lastOrder = await action.act(userId);
    expect(lastOrder).toBeUndefined();
  });
});
