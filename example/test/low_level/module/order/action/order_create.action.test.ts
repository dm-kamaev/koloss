import { OrderCreate } from '#/module/order/action/order_create.action';
import { OrderDbInMemoryFake } from '#test/fake/module/order/repository/order.db.in_memory.fake';
import { OrderProductRaw } from '#/module/order/repository/order.db';
import { UserDbInMemoryFake } from '#test/fake/module/user/repository/user.db.in_memory.fake';
import { AppCommunicatorFake } from '#test/fake/communicator';

describe('OrderCreate', () => {
  it('should create an order and return an order entity', async () => {
    const products: OrderProductRaw[] = [
      { name: 'Banana', amount: 4, price: 10 },
      { name: 'Milk', amount: 32, price: 20 },
    ];
    const orderData = { userId: UserDbInMemoryFake.defaultUser.id, products };

    const userCommunicator = new AppCommunicatorFake().user;
    const orderDb = new OrderDbInMemoryFake();

    const orderCreate = new OrderCreate(userCommunicator, orderDb);
    const orderEntity = await orderCreate.act(orderData);

    expect(orderEntity.id).toBe(1);
    expect(orderEntity.price).toBe(680);
    expect(orderEntity.countProducts).toBe(36);

    expect((await orderEntity.getUser()).id).toBe(UserDbInMemoryFake.defaultUser.id);
  });
});
