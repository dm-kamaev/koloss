import { OrderGetById } from '@/module/order/action/order_get_by_id.action';
import { OrderDbInMemoryFake } from '../../../../fake/module/order/repository/order.db.fake.in_memory';
import { OrderRaw } from '@/module/order/repository/order.db';
import { UserDbInMemoryFake } from '../../../../fake/module/user/repository/user.db.fake.in_memory';
import { AppCommunicatorFake } from '@test/fake/communicator';

describe('OrderGetById', () => {
  it('should return an order with user information', async () => {
    const orderId = 1;
    const order: OrderRaw = {
      id: orderId,
      userId: UserDbInMemoryFake.defaultUser.id,
      products: [],
      price: 0,
      status: 'pending',
      updatedAt: new Date(),
    };

    const userCommunicator = new AppCommunicatorFake().user;
    const orderDb = new OrderDbInMemoryFake({ orders: [order] });

    const orderGetById = new OrderGetById(userCommunicator, orderDb);
    const result = await orderGetById.act({ orderId });

    expect(result.id).toBe(orderId);
    expect(result.user.id).toBe(UserDbInMemoryFake.defaultUser.id);
  });
});
