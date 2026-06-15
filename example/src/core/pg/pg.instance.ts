import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB, SchemaDB } from './pg.type';

export class PgConnect {
  private dbConnect: SchemaDB | undefined;

  create() {
    if (this.dbConnect) {
      return this.dbConnect;
    }

    const dialect = new PostgresDialect({
      pool: new Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        size: 10,
      }),
    });

    return (this.dbConnect = new Kysely<DB>({
      dialect,
    }));
  }

  async destroy() {
    if (this.dbConnect) {
      await this.dbConnect.destroy();
      this.dbConnect = undefined;
    }
  }

  async rebuild() {
    await this.destroy();
    this.create();
  }
}

export const pgConnect = new PgConnect();
