import { z } from 'zod';

const schema = z.object({
  date: z.iso.datetime({ message: 'Invalid date format' }),
});

export class OrderSuccessArchiveInputDto {
  private schema = schema;

  async act(body: unknown) {
    return this.schema.parseAsync(body);
  }
}
