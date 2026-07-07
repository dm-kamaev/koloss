import { emailClientInstance } from './email_client.instance.js';

export class EmailSdk {
  constructor(private readonly emailClient = emailClientInstance) {}

  async sendText({ email, subject, message }: { email: string; subject: string; message: string }) {
    await this.emailClient.dispatch(email, subject, message);
  }
}
