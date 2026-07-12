import { Selectable } from 'kysely';
import { UserDb, UserRow } from '#/module/user/repository/user.db';
import { overridePropsOfObject, StubPropOfInstance } from '#/lib';

export class UserDbInMemoryFake extends UserDb {
  private _users: Selectable<UserRow>[] = [];

  static readonly defaultUser: Selectable<UserRow> = { id: 1234, name: 'Vasya', last_name: 'Ivanov', email: 'test@example.com' };

  constructor({ stubs, users }: { stubs?: StubPropOfInstance<typeof UserDbInMemoryFake>; users?: Selectable<UserRow>[] }) {
    super();

    this._users = users ?? [UserDbInMemoryFake.defaultUser];

    overridePropsOfObject(this, stubs || {});
  }

  async getById(userId: number) {
    const user = this._users.find((u) => u.id === userId);
    if (!user) {
      throw new Error(`User not found with id = ${userId}`);
    }
    return user;
  }

  async getAll(): Promise<Selectable<UserRow>[]> {
    return this._users;
  }

  async existWithId(userId: number): Promise<boolean> {
    return this._users.some((u) => u.id === userId);
  }
}
