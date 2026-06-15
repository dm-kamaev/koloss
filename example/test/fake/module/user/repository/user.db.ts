import { Selectable } from 'kysely';
import { UserDb, UserRow } from '@/module/user/repository/user.db';

export class UserDbFake extends UserDb {
  private _users: Selectable<UserRow>[] = [];

  static readonly defaultUser = { id: 1234, name: 'Vasya', last_name: 'Ivanov', email: 'test@example.com' };

  constructor() {
    super();
    this._users.push(UserDbFake.defaultUser);
  }

  async getById(userId: number): Promise<Selectable<UserRow>> {
    const user = this._users.find((u) => u.id === userId);
    if (!user) {
      throw new Error(`User not found with id = ${userId}`);
    }
    return user;
  }

  async existWithId(userId: number): Promise<boolean> {
    return this._users.some((u) => u.id === userId);
  }
}
