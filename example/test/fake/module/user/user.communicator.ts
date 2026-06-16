import { UserCommunicator } from '@/module/user/user.communicator';
import { IOrderCommunicator } from '@/communicator/order.communicator.type';
import { UserDbInMemoryFake } from './repository/user.db.fake.in_memory';
import { User, UserWithEmail, UserWithOrdersCount } from '@/module/user/entity/user.entity';

// import { IUserCommunicator } from '@/communicator/user.communicator.type';
// export class UserCommunicatorFake implements IUserCommunicator {
//   constructor() {}

//   getUserById(_userId: number): Promise<{ id: number; email: string }> {
//     const { id, email } = UserDbFake.defaultUser;

//     return Promise.resolve({ id, email });
//   }

//   existUserWithId(_userId: number): Promise<boolean> {
//     return Promise.resolve(true);
//   }

//   // static generateUser() {
//   //   const userId = 1234;
//   //   return new (UserWithOrdersCount(UserWithEmail(User, 'john.doe@example.com'), 0))(userId);
//   //   return { id: userId, name: 'Vasya', last_name: 'Ivanov', email: 'john.doe@example.com' };
//   // }

//   // async getUserById(userId: number) {
//   //   // const user = this.users.find((u) => u.id === userId);
//   //   // if (!user) {
//   //   //   throw new Error(`User with id ${userId} not found`);
//   //   // }
//   //   return UserCommunicatorFake.generateUser();
//   // }

//   // async existUserWithId(userId: number): Promise<boolean> {
//   //   return this.users.some((u) => u.id === userId);
//   // }
// }

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
