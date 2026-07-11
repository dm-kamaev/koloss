import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string(),
  amount: z.number().int().positive(),
  price: z.number().positive(),
});

const schema = z.object({
  user_id: z.number(),
  products: z.array(ProductSchema).min(1),
});

export class OrderCreateInputBodyDto {
  private readonly schema = schema;

  async act(body: unknown) {
    return this.schema.parseAsync(body);
  }
}

export type OrderCreateBody = Awaited<ReturnType<OrderCreateInputBodyDto['act']>>;
