import { overridePropsOfObject, StubPropOfInstance } from '#/lib';
import { UserDb } from '#/module/user/repository/user.db';
import { UsersTable } from '#/core/pg/pg.type';
import { Selectable } from 'kysely';

export class UserDbFake extends UserDb {
  // TODO: load from DB
  static readonly defaultUser = { id: 1234, name: 'Vasya', last_name: 'Ivanov', email: 'test@example.com' };

  constructor({ stubs }: { stubs?: StubPropOfInstance<typeof UserDbFake> } = {}) {
    super();

    overridePropsOfObject(this, stubs || {});
  }

  async insert(data: Omit<Selectable<UsersTable>, 'id'> & { id?: number }): Promise<Selectable<UsersTable>> {
    const row = await this.db.insertInto('users').values(data).returningAll().executeTakeFirstOrThrow();
    return row;
  }
}
