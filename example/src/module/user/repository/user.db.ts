import { NotFound } from '@/core/error/not_found.error';

export interface UserRow {
  id: number;
  name: string;
  last_name: string;
  email: string;
}

export class UserDb {
  private _users: UserRow[];

  constructor(users?: UserRow[]) {
    this._users = users || [
      {
        id: 1234,
        name: 'Vasya',
        last_name: 'Ivanov',
        email: 'test@example.com',
      },
    ];
  }

  async getById(userId: number) {
    const user = this._users.find(({ id }) => id === userId);
    if (!user) {
      throw new NotFound(`User not found with id = ${userId}`);
    }

    return user;
  }

  async existWithId(userId: number) {
    const user = this._users.find(({ id }) => id === userId);
    return Boolean(user);
  }
}
