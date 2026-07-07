import type { FastifyInstance } from 'fastify';

import { IUserCommunicator } from '#/communicator/user.communicator.type';

import { orderGetByIdHttp } from '#order/http/order_get_by_id.http';
import { OrderGetById } from '#order/action/order_get_by_id.action';

import { orderCreateHttp } from '#order/http/order_create.http';
import { OrderCreate } from '#order/action/order_create.action';

export function mountOrderRoutes({ app, userCommunicator }: { app: FastifyInstance; userCommunicator: IUserCommunicator }) {
  orderGetByIdHttp({ app, OrderGetById, userCommunicator });
  orderCreateHttp({ app, OrderCreate, userCommunicator });
}
