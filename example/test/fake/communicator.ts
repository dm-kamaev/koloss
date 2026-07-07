import { AppCommunicator } from '#/communicator';
import { UserCommunicatorFake } from './module/user/user.communicator.js';
import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { OrderCommunicatorFake } from './module/order/order.communicator.js';

export class AppCommunicatorFake extends AppCommunicator {
  private readonly UserCommunicator: typeof UserCommunicatorFake;
  private readonly OrderCommunicator: typeof OrderCommunicatorFake;

  constructor({
    UserCommunicatorCtor,
    OrderCommunicatorCtor,
  }: {
    UserCommunicatorCtor?: typeof UserCommunicatorFake;
    OrderCommunicatorCtor?: typeof OrderCommunicatorFake;
  } = {}) {
    super();

    this.UserCommunicator = UserCommunicatorCtor || UserCommunicatorFake;
    this.OrderCommunicator = OrderCommunicatorCtor || OrderCommunicatorFake;
  }
  get user() {
    return this.factory.new(this.UserCommunicator, (Class) => new Class(this.order));
  }

  get order(): IOrderCommunicator {
    return this.factory.new(this.OrderCommunicator, (Class) => new Class(this.user));
  }
}
