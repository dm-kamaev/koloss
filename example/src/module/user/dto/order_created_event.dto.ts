import { z } from 'zod';

export class OrderCreatedEventDto {
  constructor(private readonly payload: Record<string, unknown>) {}

  private static schema = z.object({
    userId: z.number().int().positive(),
    price: z.number().positive(),
  });

  async act() {
    return OrderCreatedEventDto.schema.parseAsync(this.payload);
  }
}
