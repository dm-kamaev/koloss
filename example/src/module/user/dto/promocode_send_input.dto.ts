import { parseArgs } from 'node:util';
import { z } from 'zod';

export class PromoSendInputDto {
  private readonly values: { inactivityDays?: string };

  constructor(args: string[]) {
    const { values } = parseArgs({
      args: args.slice(3),
      options: {
        inactivityDays: {
          type: 'string',
          short: 'd',
        },
      },
    });

    this.values = values;
  }

  private static schema = z.object({
    inactivityDays: z.coerce.number().int().positive({ message: 'Inactivity days must be a positive integer' }),
  });

  async act() {
    return PromoSendInputDto.schema.parseAsync(this.values);
  }
}
