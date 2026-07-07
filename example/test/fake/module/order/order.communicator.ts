import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { overridePropsOfObject, StubPropOfInstance } from '#/lib_test';
import { OrderCommunicator } from '#/module/order/order.communicator';

export class OrderCommunicatorFake extends OrderCommunicator {
  constructor(userCommunicator: IUserCommunicator, { stubs }: { stubs?: StubPropOfInstance<typeof OrderCommunicatorFake> } = {}) {
    super(userCommunicator);

    overridePropsOfObject(this, stubs || {});
  }

  getCountUserOrders(_userId: number): Promise<number> {
    return Promise.resolve(25);
  }

  getCountUserOrdersWithPriceAbove(_userId: number, _minPrice: number): Promise<number> {
    return Promise.resolve(25);
  }

  findLastOrderByUserId(_userId: number): Promise<any> {
    return Promise.resolve(undefined);
  }
}
