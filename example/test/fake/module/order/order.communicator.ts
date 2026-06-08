import { IUserCommunicator } from '@/communicator/user.communicator.type';
import { OrderCommunicator } from '@/module/order/order.communicator';

// import { IOrderCommunicator } from '@/communicator/order.communicator.type';
// export class OrderCommunicatorFake implements IOrderCommunicator {
//   constructor() {}

//   getCountUserOrders(_userId: number): Promise<number> {
//     return Promise.resolve(25);
//   }
// }

export class OrderCommunicatorFake extends OrderCommunicator {
  constructor(userCommunicator: IUserCommunicator) {
    super(userCommunicator);
  }

  getCountUserOrders(_userId: number): Promise<number> {
    return Promise.resolve(25);
  }
}
