import { IOrderCommunicator } from './communicator/order/order.type';
import { IUserCommunicator } from './communicator/user/user.type';
import * as OrderModule from './module/order';
import * as UserModule from './module/user';

import Fastify, { FastifyInstance } from 'fastify';

async function setupApplicationModules(app: FastifyInstance) {
  /**
   * Objects for cross module communications
   */
  let orderCommunicator: IOrderCommunicator;
  let userCommunicator!: IUserCommunicator;
  {
    const { createOrderContainer, OrderCommunicator, mountOrderRoutes } = OrderModule;
    // Pass lazy dependency
    const orderContainer = await createOrderContainer(() => userCommunicator);
    orderCommunicator = new OrderCommunicator(orderContainer);
    mountOrderRoutes({ app, ...orderContainer });
  }

  {
    const { createUserContainer, UserCommunicator, mountUserRoutes } = UserModule;
    const userContainer = await createUserContainer(orderCommunicator);
    userCommunicator = new UserCommunicator(userContainer);
    mountUserRoutes({ app, ...userContainer });
  }
}

void (async function () {
  const app = Fastify();

  await setupApplicationModules(app);

  app.setErrorHandler((error, request, reply) => {
    console.error(error);
    reply.code(500).send({ error: 'Internal Server Error' });
  });

  app.listen({ port: 4005 }, async function (err, address) {
    if (err) {
      throw err;
    }
    console.log('Server was started ' + address);
  });
})();
