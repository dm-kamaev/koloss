import { IUserCommunicator } from './communicator/user.communicator.type.js';
import { IOrderCommunicator } from './communicator/order.communicator.type.js';
import { Factory } from './lib.js';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

// CommonJS approach to handle circular dependencies via dynamic require()
// eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
const _require = typeof __filename !== 'undefined' ? createRequire(__filename) : createRequire(resolve(process.argv[1]));

export interface ICommunicator {
  user: IUserCommunicator;
  order: IOrderCommunicator;
}

export class AppCommunicator implements ICommunicator {
  constructor(protected readonly factory = new Factory()) {}

  get user(): IUserCommunicator {
    // Approach with common js:
    // Variant 1: Import type then require
    // import type * as UserCommunicatorModule from './module/user/user.communicator.js';
    // // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    // const { UserCommunicator } = require('./module/user/user.communicator') as typeof UserCommunicatorModule;
    // Variant 2: require with import type at one moment
    // const { UserCommunicator } = _require('./module/user/user.communicator') as typeof import('./module/user/user.communicator');

    const { UserCommunicator } = _require('./module/user/user.communicator') as typeof import('./module/user/user.communicator');
    return this.factory.new(UserCommunicator, (Class) => new Class(this.order));
  }

  get order(): IOrderCommunicator {
    const { OrderCommunicator } = _require('./module/order/order.communicator') as typeof import('./module/order/order.communicator');
    return this.factory.new(OrderCommunicator, (Class) => new Class(this.user));
  }
}

export const communicator = new AppCommunicator();
