import { AppError } from '#/core/error/app.error';

export class NotFound extends AppError {
  readonly code = 'NOT_FOUND';

  constructor(message: string) {
    super(message);
    this.name = 'NotFound';
  }

  getHttpCode(): number {
    return 404;
  }
}
