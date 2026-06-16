import { IUserCommunicator } from '@/communicator/user.communicator.type';
import { overridePropsOfObject, StubPropOfInstance } from '@/lib_test';
import { OrderCommunicator } from '@/module/order/order.communicator';

// import { IOrderCommunicator } from '@/communicator/order.communicator.type';
// export class OrderCommunicatorFake implements IOrderCommunicator {
//   constructor() {}

//   getCountUserOrders(_userId: number): Promise<number> {
//     return Promise.resolve(25);
//   }
// }

export class OrderCommunicatorFake extends OrderCommunicator {
  constructor(userCommunicator: IUserCommunicator, { stubs }: { stubs?: StubPropOfInstance<typeof OrderCommunicatorFake> } = {}) {
    super(userCommunicator);

    overridePropsOfObject(this, stubs || {});
  }

  getCountUserOrders(_userId: number): Promise<number> {
    return Promise.resolve(25);
  }
}
