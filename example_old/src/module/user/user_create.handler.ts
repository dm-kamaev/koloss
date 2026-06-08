import type { UserRepository } from './db/user.repository';

export class UserCreateHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async exec({ first_name, last_name }: { first_name: string; last_name: string }) {
    return this.userRepository.create({ first_name, last_name });
  }
}
