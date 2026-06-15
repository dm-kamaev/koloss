// emulation external library
class EmailClient {
  dispatch(email: string, subject: string, message: string) {
    console.log({ email, subject, message });
  }
}
export const emailClientInstance = new EmailClient();
