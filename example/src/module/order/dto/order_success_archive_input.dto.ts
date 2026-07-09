import { parseArgs } from 'node:util';
import { z } from 'zod';

export class OrderSuccessArchiveInputDto {
  private readonly values: { date?: string };

  constructor(args: string[]) {
    const { values } = parseArgs({
      args: args.slice(3),
      options: {
        date: {
          type: 'string',
        },
      },
    });

    this.values = values;
  }

  private static schema = z.object({
    date: z.iso.datetime({ message: 'Invalid date format' }),
  });

  async act() {
    return OrderSuccessArchiveInputDto.schema.parseAsync(this.values);
  }
}
