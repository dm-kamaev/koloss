import { UserWithEmailInstance } from './user.entity.js';
import { EmailSdk } from '#/core/email/email_sdk';

export class UserPromoCode {
  constructor(
    private readonly user: UserWithEmailInstance,
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

  async sendToUserViaEmail(
    { subject: inputSubject, body }: { subject: string | (() => string); body: (code: string) => string },
    emailClient = new EmailSdk(),
  ) {
    const subject = typeof inputSubject === 'string' ? inputSubject : inputSubject();
    await emailClient.sendText({ email: this.user.email, subject, message: body(this.code) });
  }
}
