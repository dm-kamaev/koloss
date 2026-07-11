import { IUserCommunicator } from './communicator/user.communicator.type';
import { IOrderCommunicator } from './communicator/order.communicator.type';

export interface ICommunicator {
  user: IUserCommunicator;
  order: IOrderCommunicator;
}

type Factory<Instance, InputClass extends { new (...arg: any[]): Instance }> = (Class: InputClass) => Instance;

export function createModule<Instance, InputClass extends { new (...arg: any[]): Instance }>(
  Class: InputClass,
  createInstance: Factory<Instance, InputClass>,
): Instance {
  const result = {} as Instance;

  const methodNames = Object.getOwnPropertyNames(Class.prototype).filter((m) => m !== 'constructor');

  for (const methodName of methodNames) {
    const originalMethod = Class.prototype[methodName];

    Object.defineProperty(result, methodName, {
      enumerable: true,

      value: (...args: unknown[]) => {
        // new instance every call
        const freshInstance = createInstance(Class);

        return originalMethod.apply(freshInstance, args);
      },
    });
  }

  return result;
}

function createLazyModuleProxy<T extends object>(loader: () => T): T {
  let loadedInstance: T | null = null;
  const getInstance = () => loadedInstance ?? (loadedInstance = loader());

  return new Proxy({} as T, {
    get(target: T, prop: string | symbol, receiver: any): any {
      const instance = getInstance();
      return Reflect.get(instance, prop, receiver);
    },
    set(target: T, prop: string | symbol, value: any, receiver: any): boolean {
      const instance = getInstance();
      return Reflect.set(instance, prop, value, receiver);
    },
    has(target: T, prop: string | symbol): boolean {
      const instance = getInstance();
      return Reflect.has(instance, prop);
    },
    ownKeys(_target: T): ArrayLike<string | symbol> {
      const instance = getInstance();
      return Reflect.ownKeys(instance);
    },
    getOwnPropertyDescriptor(target: T, prop: string | symbol): PropertyDescriptor | undefined {
      const instance = getInstance();
      return Reflect.getOwnPropertyDescriptor(instance, prop);
    },
    defineProperty(target: T, property: string | symbol, attributes: PropertyDescriptor): boolean {
      const instance = getInstance();
      return Reflect.defineProperty(instance, property, attributes);
    },
    deleteProperty(target: T, p: string | symbol): boolean {
      const instance = getInstance();
      return Reflect.deleteProperty(instance, p);
    },
  });
}

const communicatorInternal: ICommunicator = {
  user: null!,
  order: null!,
};

communicatorInternal.user = createLazyModuleProxy<IUserCommunicator>(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { UserCommunicator } = require('./module/user/user.communicator') as typeof import('./module/user/user.communicator');
  console.log('UserCommunicator was loaded', UserCommunicator);

  return createModule(UserCommunicator, (Class) => new Class(communicatorInternal.order));
});

communicatorInternal.order = createLazyModuleProxy<IOrderCommunicator>(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { OrderCommunicator } = require('./module/order/order.communicator') as typeof import('./module/order/order.communicator');
  console.log('OrderCommunicator was loaded', OrderCommunicator);

  return createModule(OrderCommunicator, (Class) => new Class(communicatorInternal.user));
});

export const communicator: ICommunicator = communicatorInternal;
