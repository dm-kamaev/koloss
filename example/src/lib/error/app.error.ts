import { FastifyReply } from 'fastify';

export abstract class AppError extends Error {
  abstract readonly code: string;

  constructor(public readonly msg: string) {
    super(msg);
  }

  toJSON() {
    return {
      code: this.code,
      msg: this.msg,
    };
  }

  pipeTo(reply: FastifyReply): void {
    reply.status(this.getHttpCode()).send(this.toJSON());
  }

  abstract getHttpCode(): number;
}
