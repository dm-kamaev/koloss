import type { FastifyInstance } from 'fastify';

import { IOrderCommunicator } from '@/communicator/order.communicator.type';

import { UserGetById } from '@/module/user/action/user_get_by_id.action';
import { userGetById } from '@/module/user/http/user_get_by_id.http';

export function mountUserRoutes({ app, orderCommunicator }: { app: FastifyInstance; orderCommunicator: IOrderCommunicator }) {
  userGetById({ app, UserGetById, orderCommunicator });
}
