import { UserDb, UserRow } from '@/module/user/repository/user.db';

export class UserDbFake extends UserDb {
  static readonly defaultUser = { id: 1234, name: 'Vasya', last_name: 'Ivanov', email: 'john.doe@example.com' };

  constructor(users: UserRow[] = [UserDbFake.defaultUser]) {
    super(users);
  }
}
