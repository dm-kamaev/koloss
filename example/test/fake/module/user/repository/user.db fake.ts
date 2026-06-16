import { overridePropsOfObject, StubPropOfInstance } from '@/lib_test';
import { UserDb } from '@/module/user/repository/user.db';

export class UserDbFake extends UserDb {
  // TODO: load from DB
  static readonly defaultUser = { id: 1234, name: 'Vasya', last_name: 'Ivanov', email: 'test@example.com' };

  constructor({ stubs }: { stubs?: StubPropOfInstance<typeof UserDbFake> }) {
    super();

    overridePropsOfObject(this, stubs || {});
  }
}
