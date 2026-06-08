import { GetLazy, RegistryComposer } from '../../../../src/index';
import { IUserCommunicator } from '../../communicator/user/user.type';
import { OrderRepository } from './db/order.repository';
import { OrderGetAllHandler } from './order_get_all.handler';
import { OrderGetAllForUserHandler } from './order_get_all_for_user.handler';
import { OrderCreateHandler } from './order_сreate.handler';

export { mountOrderRoutes } from './order.http';
export { OrderCommunicator } from './order.communicator';

export interface OrderContainer {
  orderRepository: OrderRepository;
  orderGetAllHandler: OrderGetAllHandler;
}

// TODO: add support async/await
export async function createOrderContainer(userCommunicator: GetLazy<IUserCommunicator>) {
  const registry = await new RegistryComposer()
    .add(() => ({
      orderRepository: new OrderRepository(),
    }))
    .add(({ orderRepository }) => {
      return {
        orderGetAllHandler: new OrderGetAllHandler(orderRepository, userCommunicator),
      };
    })
    .add(({ orderRepository }) => {
      return {
        orderGetAllForUserHandler: new OrderGetAllForUserHandler(orderRepository),
      };
    })
    .add(({ orderRepository }) => {
      return {
        orderCreateHandler: new OrderCreateHandler(orderRepository),
      };
    })
    .compose();

  return registry;
}

// const { orderGetAllHandler } = createOrderContainer();
// const result = orderGetAllHandler.exec();
//    ^?

// const { orderReceiptGenerator, orderService } = createAppRegistry();
// orderReceiptGenerator.hello('World');
// orderService.greet();
