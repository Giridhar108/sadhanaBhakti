import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe<TValue> implements PipeTransform<unknown, TValue> {
  constructor(private readonly schema: ZodType<TValue>) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }

    return result.data;
  }
}
