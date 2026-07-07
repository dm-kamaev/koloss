import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { OrderDb, OrderProductRaw } from '#/module/order/repository/order.db';
import { Order, OrderWithCountProducts, OrderWithPrice, OrderWithUpdatedAt, OrderWithUser } from '#/module/order/entity/order.entity';

export class OrderCreate {
  constructor(
    private readonly userCommunicator: IUserCommunicator,
    private readonly orderDb = new OrderDb(),
  ) {}

  async act(orderData: { userId: number; products: OrderProductRaw[] }) {
    const orderRaw = await this.orderDb.create(orderData);

    const OrderEntity = OrderWithCountProducts(
      OrderWithPrice(
        OrderWithUpdatedAt(OrderWithUser(Order, orderRaw.userId, this.userCommunicator), orderRaw.updatedAt),
        orderRaw.products,
      ),
      orderRaw.products,
    );

    return new OrderEntity(orderRaw.id);
  }
}

export type OrderCreateCtor = typeof OrderCreate;
