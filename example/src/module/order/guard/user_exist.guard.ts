import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { NotFound } from '#/core/error/not_found.error';

export class UserExistGuard {
  constructor(private readonly userCommunicator: IUserCommunicator) {}

  async act(userId: number) {
    if (!(await this.userCommunicator.existUserWithId(userId))) {
      throw new NotFound(`User not found with id = ${userId}`);
    }
  }
}
