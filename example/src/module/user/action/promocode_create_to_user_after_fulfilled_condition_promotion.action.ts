import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { UserDb } from '#user/repository/user.db';
import { User, UserWithEmail } from '#user/entity/user.entity';
import { UserPromoCode } from '#user/value_object/user_promocode.value_object';

export class PromoCodeCreateToUserAfterFulfilledConditionPromotion {
  constructor(
    private readonly orderCommunicator: IOrderCommunicator,
    private readonly userDb = new UserDb(),
  ) {}

  async act(data: { userId: number; price: number }) {
    const countOrders = 10;
    const minPriceOrder = 1000;

    if ((await this.orderCommunicator.getCountUserOrdersWithPriceAbove(data.userId, minPriceOrder)) < countOrders) {
      return undefined;
    }

    const userRow = await this.userDb.getById(data.userId);
    const UserWithEmailClass = UserWithEmail(User, userRow.email);
    const user = new UserWithEmailClass(userRow.id);
    return new UserPromoCode(user);
  }
}

export type PromoCodeCreateToUserAfterFulfilledConditionPromotionCtor = typeof PromoCodeCreateToUserAfterFulfilledConditionPromotion;
