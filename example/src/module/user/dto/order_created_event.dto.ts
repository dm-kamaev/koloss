import { z } from 'zod';

const schema = z.object({
  userId: z.number().int().positive(),
  price: z.number().positive(),
});

export class OrderCreatedEventDto {
  private schema = schema;

  async act(payload: unknown) {
    return this.schema.parseAsync(payload);
  }
}
