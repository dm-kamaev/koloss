import { IUserCommunicator } from '@/communicator/user.communicator.type';
import { UserPromoCode } from '../entity/user_promocode.entity';

export class PromoCodeCreateToUserAfterFulfilledConditionPromotion {
  constructor(private readonly userCommunicator: IUserCommunicator) {}

  async act(data: { userId: number; countProducts: number; price: number }) {
    if (!(data.countProducts > 10 && data.price >= 1000)) {
      return undefined;
    }

    const user = await this.userCommunicator.getUserById(data.userId);
    return new UserPromoCode(user);
  }
}

export type PromoCodeCreateToUserAfterFulfilledConditionPromotionCtor = typeof PromoCodeCreateToUserAfterFulfilledConditionPromotion;
