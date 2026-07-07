import type { FastifyInstance } from 'fastify';

import { IOrderCommunicator } from '#/communicator/order.communicator.type';

import { UserGetById } from '#user/action/user_get_by_id.action';
import { userGetByIdHttp } from '#user/http/user_get_by_id.http';

export function mountUserRoutes({ app, orderCommunicator }: { app: FastifyInstance; orderCommunicator: IOrderCommunicator }) {
  userGetByIdHttp({ app, UserGetById, orderCommunicator });
}
