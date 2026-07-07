import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { UserGetById } from './action/user_get_by_id.action.js';
import { UserExistWithId } from './action/user_exist_with_id.action.js';

export class UserCommunicator implements IUserCommunicator {
  constructor(
    private readonly orderCommunicator: IOrderCommunicator,
    private readonly UserGetByIdCtor = UserGetById,
    private readonly UserExistWithIdCtor = UserExistWithId,
  ) {}

  /**
   * * throw error if user not found
   */
  async getUserById(userId: number) {
    return new this.UserGetByIdCtor(this.orderCommunicator).act({ userId });
  }

  async existUserWithId(userId: number) {
    return new this.UserExistWithIdCtor().act({ userId });
  }
}
