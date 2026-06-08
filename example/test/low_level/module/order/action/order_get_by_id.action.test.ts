import { OrderGetById } from '@/module/order/action/order_get_by_id.action';
import { OrderDbFake } from '../../../../fake/module/order/repository/order.db';
import { OrderRaw } from '@/module/order/repository/order.db';
import { UserDbFake } from '../../../../fake/module/user/repository/user.db';
import { AppCommunicatorFake } from '@test/fake/communicator';

describe('OrderGetById', () => {
  it('should return an order with user information', async () => {
    const orderId = 1;
    const order: OrderRaw = {
      id: orderId,
      userId: UserDbFake.defaultUser.id,
      products: [],
      price: 0,
      status: 'pending',
      updatedAt: new Date(),
    };

    const userCommunicator = new AppCommunicatorFake().user;
    const orderDb = new OrderDbFake([order]);

    const orderGetById = new OrderGetById(userCommunicator, orderDb);
    const result = await orderGetById.act({ orderId });

    expect(result.id).toBe(orderId);
    expect(result.user.id).toBe(UserDbFake.defaultUser.id);
  });
});
