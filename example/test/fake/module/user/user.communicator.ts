import { UserCommunicator } from '#/module/user/user.communicator';
import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { UserDbInMemoryFake } from './repository/user.db.in_memory.fake';
import { User, UserWithEmail, UserWithOrdersCount } from '#/module/user/entity/user.entity';

export class UserCommunicatorFake extends UserCommunicator {
  constructor(orderCommunicator: IOrderCommunicator) {
    super(orderCommunicator);
  }

  getUserById(_userId: number) {
    const { id, email } = UserDbInMemoryFake.defaultUser;
    const orderCounts = 1;

    const UserEntity = UserWithOrdersCount(UserWithEmail(User, email), orderCounts);
    return Promise.resolve(new UserEntity(id));
  }

  existUserWithId(_userId: number): Promise<boolean> {
    return Promise.resolve(true);
  }
}
