// ENTRY point for run http server

import Fastify, { FastifyInstance } from 'fastify';

import { AppError } from '@/core/error/app.error';
import { mountUserRoutes } from '@/module/user/user.http.router';
import { mountOrderRoutes } from '@/module/order/order.http.router';

import { communicator } from './communicator';

export const appErrorLogger = {
  error: console.error,
};

export function createApp() {
  const app = Fastify();
  setupErrorHandler(app);

  return app;
}

function mountRoutes(app: FastifyInstance) {
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

function startServer(app: FastifyInstance) {
  app.listen({ port: 4005, host: '0.0.0.0' }, async function (err, address) {
    if (err) {
      throw err;
    }
    console.log('Server was started ' + address);
  });
}

if (require.main === module) {
  startServer(mountRoutes(createApp()));
}
