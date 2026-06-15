import { NotFound } from '@/core/error/not_found.error';
import { SchemaDB, UsersTable } from '@/core/pg/pg.type';
import { pgConnect } from '@/core/pg/pg.instance';

export type UserRow = UsersTable;

export class UserDb {
  private readonly db: SchemaDB;

  constructor() {
    this.db = pgConnect.create();
  }
  async getById(userId: number) {
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
}
