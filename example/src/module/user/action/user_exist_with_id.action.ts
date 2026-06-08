import { UserDb } from '../repository/user.db';

export class UserExistWithId {
  constructor(private readonly userDb = new UserDb()) {}

  async act({ userId }: { userId: number }) {
    return await this.userDb.existWithId(userId);
  }
}

export type UserExistWithIdCtor = typeof UserExistWithId;
