import { UserDb } from '../repository/user.db';

export class UserGetAll {
  constructor(private readonly userDb = new UserDb()) {}

  async act(): Promise<Array<{ id: number; email: string }>> {
    const users = await this.userDb.getAll();
    return users.map((user) => ({ id: user.id, email: user.email }));
  }
}

export type UserGetAllCtor = typeof UserGetAll;
