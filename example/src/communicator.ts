import { IUserCommunicator } from './communicator/user.communicator.type';
import { IOrderCommunicator } from './communicator/order.communicator.type';
import { Factory } from './lib';

export interface ICommunicator {
  user: IUserCommunicator;
  order: IOrderCommunicator;
}

export class AppCommunicator implements ICommunicator {
  constructor(protected readonly factory = new Factory()) {}

  get user(): IUserCommunicator {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { UserCommunicator } = require('./module/user/user.communicator') as typeof import('./module/user/user.communicator');
    // console.log('UserCommunicator was loaded', UserCommunicator);

    // ALTERANTIVE load:
    // Import type
    // import type * as UserCommunicatorModule from './module/user/user.communicator';
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    // const { UserCommunicator } = require('./module/user/user.communicator') as typeof UserCommunicatorModule;

    return this.factory.new(UserCommunicator, (Class) => new Class(this.order));
  }

  get order(): IOrderCommunicator {
    // return 2;
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { OrderCommunicator } = require('./module/order/order.communicator') as typeof import('./module/order/order.communicator');
    console.log('OrderCommunicator was loaded', OrderCommunicator);

    return this.factory.new(OrderCommunicator, (Class) => new Class(this.user));
  }
}

export const communicator = new AppCommunicator();
