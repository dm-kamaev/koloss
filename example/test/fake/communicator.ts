import { AppCommunicator } from '@/communicator';
import { UserCommunicatorFake } from './module/user/user.communicator';
import { IOrderCommunicator } from '@/communicator/order.communicator.type';
import { OrderCommunicatorFake } from './module/order/order.communicator';

export class AppCommunicatorFake extends AppCommunicator {
  get user() {
    return this.factory.new(UserCommunicatorFake, (Class) => new Class(this.order));
  }

  get order(): IOrderCommunicator {
    return this.factory.new(OrderCommunicatorFake, (Class) => new Class(this.user));
  }
}
