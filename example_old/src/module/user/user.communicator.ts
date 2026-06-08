import type { IUserCommunicator } from '../../communicator/user/user.type';
import type { UserGetByIdHandler } from './user_get_by_id.handler';

export class UserCommunicator implements IUserCommunicator {
  constructor(
    private readonly handlers: {
      userGetByIdHandler: UserGetByIdHandler;
    },
  ) {}

  async getUsersByIds(userIds: number[]) {
    const user: {
      id: number;
      first_name: string;
      last_name: string;
    }[] = [];

    for (const userId of userIds) {
      user.push(await this.handlers.userGetByIdHandler.exec(userId));
    }

    return user;
  }
}
