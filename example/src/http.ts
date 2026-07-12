// ENTRY point for run http server

import Fastify, { FastifyInstance } from 'fastify';

import { AppError } from '#/core/error/app.error';
import { mountUserRoutes } from '#user/user.http.router';
import { mountOrderRoutes } from '#order/order.http.router';

import { communicator } from '#/communicator';
import { isEntryPointESM } from '#/lib';

export const appErrorLogger = {
  error: console.error,
};

export function createApp() {
  const app = Fastify();
  setupErrorHandler(app);

  return app;
}

export function mountRoutes(app: FastifyInstance) {
  mountUserRoutes({ app, orderCommunicator: communicator.order });
  mountOrderRoutes({ app, userCommunicator: communicator.user });

  return app;
}

function setupErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    appErrorLogger.error(error);
    if (error instanceof AppError) {
      error.pipeTo(reply);
    } else {
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
}

export function startServer(app: FastifyInstance) {
  app.listen({ port: 4005, host: '0.0.0.0' }, async function (err, address) {
    if (err) {
      throw err;
    }
    console.log('Server was started ' + address);
  });
}

if (isEntryPointESM(import.meta.url)) {
  startServer(mountRoutes(createApp()));
}
