import { setTimeout } from 'node:timers/promises';
import { RegistryComposer } from '../../../../src/index';
import { IOrderCommunicator } from '../../communicator/order/order.type';
import { UserRepository } from './db/user.repository';
import { UserCreateHandler } from './user_create.handler';
import { UserGetByIdHandler } from './user_get_by_id.handler';

export { mountUserRoutes } from './user.http';
export { UserCommunicator } from './user.communicator';

// export interface OrderContainer {
//   orderRepository: OrderRepository;
//   orderGetAllHandler: OrderGetAllHandler;
// }

export async function createUserContainer(orderCommunicator: IOrderCommunicator) {
  const registry = await new RegistryComposer()
    .add(() => ({
      userRepository: new UserRepository(),
    }))
    .add(async ({ userRepository }) => {
      await setTimeout(1000);
      console.log('After timeout');
      return {
        userGetByIdHandler: new UserGetByIdHandler(userRepository, orderCommunicator),
      };
    })
    .add(({ userRepository }) => {
      return {
        userCreateHandler: new UserCreateHandler(userRepository),
      };
    })
    .compose();

  return registry;
}
