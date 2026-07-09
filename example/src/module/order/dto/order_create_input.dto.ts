import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string(),
  amount: z.number().int().positive(),
  price: z.number().positive(),
});

export class OrderCreateInputBodyDto {
  constructor(private readonly body: unknown) {}

  private static schema = z.object({
    user_id: z.number(),
    products: z.array(ProductSchema).min(1),
  });

  async act() {
    return OrderCreateInputBodyDto.schema.parseAsync(this.body);
  }
}

export type OrderCreateBody = Awaited<ReturnType<OrderCreateInputBodyDto['act']>>;
