import { z } from 'zod';

const schema = z.object({
  inactivityDays: z.coerce.number().int().positive({ message: 'Inactivity days must be a positive integer' }),
});

export class PromoSendInputDto {
  private schema = schema;

  async act(body: unknown) {
    return this.schema.parseAsync(body);
  }
}
