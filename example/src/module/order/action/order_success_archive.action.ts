import { IUserCommunicator } from '@/communicator/user.communicator.type';
import { OK } from '@/lib';
import { OrderDb } from '../repository/order.db';

export class OrderSuccessArchive {
  constructor(
    private readonly userCommunicator: IUserCommunicator,
    private readonly orderDb = new OrderDb(),
  ) {}

  async act(twentyFourHoursAgo: string) {
    console.log('ACTION: OrderSuccessArchive');

    const olderThanDate = new Date(twentyFourHoursAgo);

    const ordersToArchive = await this.orderDb.findCompletedOlderThan(olderThanDate);

    if (ordersToArchive.length === 0) {
      console.log(`No completed orders older than ${olderThanDate.toISOString()} to archive.`);
      return OK;
    }

    console.log(`Found ${ordersToArchive.length} orders to archive.`);
    for (const order of ordersToArchive) {
      await this.orderDb.archive(order.id);
      console.log('+++++++++++++++++++++');
      console.log(`Archived order with id: ${order.id}`);
      const userInfo = await this.userCommunicator.getUserById(order.userId);
      console.log(`User info: id = ${userInfo.id}`);
    }

    console.log('ACTION Finished: OrderSuccessArchive');
    return OK;
  }
}

export type OrderSuccessArchiveCtor = typeof OrderSuccessArchive;
