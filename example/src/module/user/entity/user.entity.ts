type Constructor<T = object> = new (...args: any[]) => T;

export class User {
  constructor(public readonly id: number) {}
}

// =========== Mixins ===========
export function UserWithEmail<TBase extends Constructor>(Base: TBase, email: string) {
  return class extends Base {
    public readonly email = email;
  };
}

export function UserWithOrdersCount<TBase extends Constructor>(Base: TBase, orderCounts: number) {
  return class extends Base {
    public readonly orderCounts = orderCounts;
  };
}
