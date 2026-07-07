import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { OrderProductRaw } from '../repository/order.db.js';

type Constructor<T = object> = new (...args: any[]) => T;

export class Order {
  constructor(public readonly id: number) {}
}

// =========== Mixins ===========
export function OrderWithUpdatedAt<TBase extends Constructor>(Base: TBase, updatedAt: Date) {
  return class extends Base {
    public readonly updatedAt = updatedAt;
  };
}

/**
 * total price of order
 */
export function OrderWithPrice<TBase extends Constructor>(Base: TBase, products: OrderProductRaw[]) {
  return class extends Base {
    get price() {
      return products.reduce((acc, product) => acc + product.price * product.amount, 0);
    }
  };
}

export function OrderWithCountProducts<TBase extends Constructor>(Base: TBase, products: OrderProductRaw[]) {
  return class extends Base {
    get countProducts() {
      return products.reduce((total, el) => total + el.amount, 0);
    }
  };
}

/**
 * If we based on previous attached data
 * export function OrderWithUser<TBase extends Constructor<{ userId: number }>>(
 */

export function OrderWithUser<TBase extends Constructor>(Base: TBase, userId: number, userCommunicator: IUserCommunicator) {
  return class extends Base {
    constructor(...args: any[]) {
      super(...args);
    }

    async getUser() {
      return userCommunicator.getUserById(userId);
    }
  };
}
