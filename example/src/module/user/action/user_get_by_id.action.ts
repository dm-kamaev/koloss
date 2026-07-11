import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { UserDb } from '../repository/user.db';
import { User, UserWithEmail, UserWithOrdersCount } from '../entity/user.entity';

export class UserGetById {
  constructor(
    private readonly orderCommunicator: IOrderCommunicator,
    private readonly userDb = new UserDb(),
  ) {}

  async act({ userId }: { userId: number }) {
    const [userRow, orderCounts] = await Promise.all([this.userDb.getById(userId), this.orderCommunicator.getCountUserOrders(userId)]);

    const UserEntity = UserWithOrdersCount(UserWithEmail(User, userRow.email), orderCounts);

    return new UserEntity(userRow.id);
  }
}

export type UserGetByIdCtor = typeof UserGetById;
