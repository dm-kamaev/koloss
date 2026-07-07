import { NotFound } from '#/core/error/not_found.error';
import { SchemaDB, UsersTable } from '#/core/pg/pg.type';
import { pgConnect } from '#/core/pg/pg.instance';
import { Selectable } from 'kysely';

export type UserRow = Selectable<UsersTable>;

export class UserDb {
  protected readonly db: SchemaDB;

  constructor() {
    this.db = pgConnect.create();
  }
  async getById(userId: number): Promise<UserRow> {
    const user = await this.db.selectFrom('users').selectAll().where('id', '=', userId).executeTakeFirst();

    if (!user) {
      throw new NotFound(`User not found with id = ${userId}`);
    }

    return user;
  }

  async existWithId(userId: number) {
    const user = await this.db.selectFrom('users').select('id').where('id', '=', userId).executeTakeFirst();

    return Boolean(user);
  }

  async getAll(): Promise<UserRow[]> {
    return await this.db.selectFrom('users').selectAll().execute();
  }
}
