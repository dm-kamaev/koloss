import { UserWithEmail } from './user.entity';
import { EmailSdk } from '@/core/email/email_sdk';

// type Constructor<T = object> = new (...args: any[]) => T;

type UserWE = InstanceType<ReturnType<typeof UserWithEmail>>;

export class UserPromoCode {
  constructor(
    private readonly user: UserWE,
    private readonly code = this.generatePromocode(),
  ) {}

  private generatePromocode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async sendToUserViaEmail(emailClient: EmailSdk, { subject, body }: { subject: () => string; body: (code: string) => string }) {
    await emailClient.sendText({ email: this.user.email, subject: subject(), message: body(this.code) });
  }
}

// =========== Mixins ===========
// export function UserWithEmail<TBase extends Constructor>(Base: TBase, email: string) {
//   return class extends Base {
//     public readonly email = email;
//   };
// }

// export function UserWithOrdersCount<TBase extends Constructor>(Base: TBase, orderCounts: number) {
//   return class extends Base {
//     public readonly orderCounts = orderCounts;
//   };
// }
