import crypto from 'node:crypto';

export class UserRepository {
  private readonly users: Array<{
    id: number;
    first_name: string;
    last_name: string;
  }> = [];

  getAll() {
    return this.users;
  }
  getById(id: number) {
    return this.users.find((el) => el.id === id);
  }

  create(order: Omit<UserRepository['users'][number], 'id'>) {
    const id = crypto.randomInt(10000);
    this.users.push({
      ...order,
      id,
    });
    return { id };
  }
}
