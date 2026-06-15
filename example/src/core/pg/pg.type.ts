import { ColumnType, Generated, Kysely } from 'kysely';

export interface UsersTable {
  id: Generated<number>;
  name: string;
  last_name: string;
  email: string;
}

export type OrderStatus = 'pending' | 'completed' | 'archived';

export interface OrdersTable {
  id: Generated<number>;
  user_id: number;
  products: ColumnType<any, string, string>; // JSONB
  price: number;
  status: OrderStatus;
  updated_at: ColumnType<Date, string, string>;
}

export interface DB {
  users: UsersTable;
  orders: OrdersTable;
}

export type SchemaDB = Kysely<DB>;
