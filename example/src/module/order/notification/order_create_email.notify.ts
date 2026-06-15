import { EmailSdk } from '@/core/email/email_sdk';

export class OrderCreateEmailNotify {
  constructor(private readonly emailSdk = new EmailSdk()) {}
  async act({ email, data }: { email: string; data: { id: number; price: number; createdAt: Date } }) {
    const subject = `# Order №${data.id} was created ${data.createdAt.toLocaleDateString()}`;
    const message = `Order №${data.id} with price ${data.price} is awaiting payment`;

    await this.emailSdk.sendText({
      email,
      subject,
      message,
    });
  }
}
