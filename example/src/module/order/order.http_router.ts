import type { FastifyInstance } from 'fastify';

import { IUserCommunicator } from '@/communicator/user.communicator.type';

import { orderGetById } from '@/module/order/http/order_get_by_id.http';
import { OrderGetById } from '@/module/order/action/order_get_by_id.action';

import { orderCreate } from '@/module/order/http/order_create.http';
import { OrderCreate } from '@/module/order/action/order_create.action';

export function mountOrderRoutes({ app, userCommunicator }: { app: FastifyInstance; userCommunicator: IUserCommunicator }) {
  orderGetById({ app, OrderGetById, userCommunicator });
  orderCreate({ app, OrderCreate, userCommunicator });
}
