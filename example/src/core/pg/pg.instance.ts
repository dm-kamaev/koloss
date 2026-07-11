import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB, SchemaDB } from './pg.type';

export interface PgConnectConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  poolSize?: number;
}

export class PgConnect {
  private dbConnect: SchemaDB | undefined;

  constructor(private readonly config: PgConnectConfig) {}

  create() {
    if (this.dbConnect) {
      return this.dbConnect;
    }

    const dialect = new PostgresDialect({
      pool: new Pool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        size: this.config.poolSize ?? 10,
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

export const pgConnect = new PgConnect({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER ?? 'koloss',
  password: process.env.DB_PASSWORD ?? 'example',
  database: process.env.DB_NAME ?? 'koloss',
});
