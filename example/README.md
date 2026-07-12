# Koloss

**Kolos** is template for creating a modular monolith (inspired DDD, Hexagonal/Onion/Clean Architecture and SOLID).
Key items from the box:
* A set of **application layers** for code splitting by area of responsibility: `HTTP/CLI/Consumer (Controller)`,`Action (Use Case)`,`Entity`, `Value Object`, `Repository` and etc
* **Cross module communication** allows modules to be isolated from each other while still allowing them to reuse each other's functionality. This allows different team members to develop functionality in parallel by agreeing on a contract for interaction throught interfaces.
* In addition, thanks to **lazy loading of modules** the problem of cyclic dependencies between him is completely solved. Besides lazy loading allows you to reduce consumption RAM and avoid loading unnecessary code which is extremely important in CLI/Cron tasks or in various consumer handlers (Kafka, RabbitMQ and etc).

- [Layers](#layers)
  - [HTTP, CLI, Consumer and etc](#http-cli-consumer-and-etc)
    - [HTTP](#http)
    - [CLI](#cli)
    - [Consumer](#consumer)
  - [Action (UseCase)](#action-usecase)
  - [Decorator](#decorator)
  - [Repository](#repository)
  - [Entity](#entity)
  - [Value Object](#value-object)
  - [Cross module communication](#cross-module-communication)
  - [DTO](#dto)
  - [Guard](#guard)
- [Entry point](#entry-point)
  - [HTTP](#http-1)
  - [CLI](#cli-1)
  - [Consumer](#consumer-1)
- [Don't use services](#dont-use-services)
- [Shared code](#shared-code)
- [Test](#test)
  - [Low level](#low-level)
  - [Middle level](#middle-level)
  - [Up level](#up-level)
- [Architecture Decisions](#architecture-decisions)
  - [Loading modules](#loading-modules)
  - [Entity composition via mixins](#entity-composition-via-mixins)
  - [Value objects with behavior](#value-objects-with-behavior)
  - [Per-call instantiation](#per-call-instantiation)
  - [Communicators are the only cross-module API](#communicators-are-the-only-cross-module-api)
- [TODO](#todo)

## Layers
Every module (e.g. `src/module/user/`, `src/module/order/`) may contain some or all of these layers:
```
http/         — HTTP route handlers per action. Similarly for GraphQL (graphql), JSON-RPC (json_rpc), gRPC (grpc), SOAP (soap) and etc
cli/          — CLI handlers per action. Jobs which invoke from command line by manual or by cron schedule
consumer/     — Kafka/RabbitMQ/... consumer handlers
dto/          — Input/output validation schemas (example, Zod classes)
action/       — Use cases. Classes for perfoming a specific business operation. For example, `OrderCreate`. It has one public method `act()`.
entity/       — Domain entities. Classes has core behaviours. For example, `Order`. It has unique identificator like `id`.
value_object/ — Domain value objects with behavior. For example, `Money`, `Date`, `ScreenSize`. It's compared by value.
repository/   — Storage access: Database (MySQL, Postgres, Redis and etc), S3, File system, API (external services) and etc.
decorator/    — Cross-cutting concerns side effects: logging, prodduce data to external system and etc.
guard/        — Authorization and policy checks (RBAC, ABAC)
metric/       — Instead using services create classes for specific bussiness operation with screaming name. For example, publishing order metrica via Kafka.
notification/ — Instead using services create classes for specific bussiness operation with screaming name. For example, dispatch email to user after order create.
*.communicator.ts     — Public API for cross-module calls
*.http.router.ts      — Route registration
*.cli.router.ts       — Command registration
*.consumer.router.ts  — Kafka/RabbitMQ consumer registration
```
Most of the layers is optional.

* Minimal  files for adding new http handler: `${module_name}.http.router.ts -> http/${entity}_${action_name}.http.ts -> action/${entity}_${action}.action.ts`. Example: `user.http.router.ts -> http/user_get_by_id.http.ts -> action/user_get_by_id.action.ts`

* Minimal  files for adding new cli command: `${module_name}.cli.router.ts -> cli/${entity}_${action_name}.cli.ts -> action/${entity}_${action}.action.ts`. Example: `user.cli.router.ts -> cli/promocode_send_to_users_didnt_make_order_for_too_long.cli.ts -> src/module/user/action/promocode_create_to_users_didnt_make_order_for_too_long.action.ts`

* Minimal  files for adding new consumer: `${module_name}.consumer.router.ts -> consumer/${entity}_${action_name}.cli.ts -> action/${entity}_${action}.action.ts`. Example: `user.consumer.router.ts -> consumer/promocode_create_to_user_after_fulfilled_condition_promotion.consumer.ts -> action/promocode_create_to_user_after_fulfilled_condition_promotion.action.ts`



### HTTP, CLI, Consumer and etc
`*.http|cli|consumer.ts` like `controller` in famous frameworks.
This is port(adapter) for processing requests coming from outside. This layer known about your http framework, approach of run cron/cli task or library which uses to consuming message from broker messageq or queues.

#### HTTP
Each HTTP handler is a **factory function** that receives `{ app, ActionCtor, communicator? }`and registers a Fastify route. Routers collect all handlers within a module:

```ts
// src/module/order/order.http.router.ts
import type { FastifyInstance } from 'fastify';

import { IUserCommunicator } from '#/communicator/user.communicator.type';

import { orderCreateHttp } from '#order/http/order_create.http';
import { OrderCreate } from '#order/action/order_create.action';

export function mountOrderRoutes({ app, userCommunicator }: { app: FastifyInstance; userCommunicator: IUserCommunicator }) {
  orderCreateHttp({ app, OrderCreate, userCommunicator });
}
```

Handler route `POST /order` — DTOs live in a `dto/` subdirectory per module:
```ts
// src/module/order/http/order_create.http.ts
import type { FastifyInstance } from 'fastify';
import { OrderCreateCtor } from '#/module/order/action/order_create.action';
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { AfterOrderCreate } from '#order/decorator/after_order_create.decorator';
import { OrderCreateEmailNotify } from '#order/notification/order_create_email.notify';
import { OrderCreateMetric } from '#order/metric/order_create_metric.metric';
import { UserExistGuard } from '#order/guard/user_exist.guard';
import { OrderCreateInputBodyDto, OrderCreateBody } from '#order/dto/order_create_input.dto';

export function orderCreateHttp({
  app,
  OrderCreate,
  userCommunicator,
}: {
  app: FastifyInstance;
  OrderCreate: OrderCreateCtor;
  userCommunicator: IUserCommunicator;
}) {
  app.post<{
    Body: OrderCreateBody;
  }>('/order', async function handler(req, reply) {
    const { user_id: userId, products } = await new OrderCreateInputBodyDto().act(req.body);

    await new UserExistGuard(userCommunicator).act(userId);

    const order = new OrderCreate(userCommunicator).act({ userId, products });

    const user = await order.getUser();

    reply.status(201).send({
      id: order.id,
      price: order.price,
      countProducts: order.countProducts,
      updatedAt: order.updatedAt,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  });
}
```

#### CLI
The CLI entry point (`src/cli.ts`) uses `parseArgs` from `node:util` to select a named job, then delegates. Routers register jobs with **dynamic `import()`** for lazy loading:
```ts
// src/module/order/order.cli.router.ts
import { AsyncOK } from '#/lib';
import { communicator } from '#/communicator';

export const orderJobs: Record<string, () => AsyncOK> = {
  orderSuccessArchive: async () => {
    const { orderSuccessArchiveCli } = await import('#/module/order/cli/order_success_archive.cli');
    const { OrderSuccessArchive } = await import('#/module/order/action/order_success_archive.action');
    return await orderSuccessArchiveCli({ OrderSuccessArchive, userCommunicator: communicator.user, args: process.argv });
  },
};
```
Lazy load module (`import`) provides loading only needed dependencies. It reduce memory consumtion and increase isolation code in runtime.
Otherwise, running one command will load all commands and all modules for them.


A CLI handler is a factory function that receives `{ ActionCtor, communicator, args }`. DTOs are classes with a `private static` Zod schema and an `act()` method:

```ts
// src/module/order/cli/order_success_archive.cli.ts
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { OrderSuccessArchiveCtor } from '#order/module/order/action/order_success_archive.action';
import { OrderSuccessArchiveInputDto } from '#order/dto/order_success_archive_input.dto';

export async function orderSuccessArchiveCli({
  OrderSuccessArchive,
  userCommunicator,
  args = process.argv,
}: {
  OrderSuccessArchive: OrderSuccessArchiveCtor;
  userCommunicator: IUserCommunicator;
  args: string[];
}) {
  const parsedArgs = await new OrderSuccessArchiveInputDto().act(args);

  const action = new OrderSuccessArchive(userCommunicator);

return await action.act(parsedArgs.date);
}
```

#### Consumer
The consumer entry point (`src/consumer.ts`) connects via `kafkajs`, subscribes to a topic, and runs `eachMessage`. Consumer routers define entries:
```ts
// src/module/user/user.consumer.router.ts
import { communicator } from '#/communicator';
import { ConsumerDescriptor } from '#/lib';

export const userConsumers: ConsumerDescriptor[] = [
  {
    name: 'promoCodeSendToUserAfterFulfilledConditionPromotion',
    topic: 'order_metrics',
    handler: async (payload) => {
      const { promoCodeSendToUserAfterFulfilledConditionPromotionConsumer } = await import(
        '#/module/user/consumer/promocode_create_to_user_after_fulfilled_condition_promotion.consumer'
      );
      const { PromoCodeCreateToUserAfterFulfilledConditionPromotion } = await import(
        '#user/action/promocode_create_to_user_after_fulfilled_condition_promotion.action'
      );

      await promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
        PromoCodeCreateToUserAfterFulfilledConditionPromotion,
        orderCommunicator: communicator.order,
        payload,
      });
    },
  },
];
```
Lazy load module (`import`) provides loading only needed dependencies. It reduce memory consumtion and increase isolation code in runtime. Otherwise, running one consumer will load all consumer and all modules for them.

Consumer handlers validate payloads with a class-based DTO pattern and delegate to decorator-wrapped actions:
```ts
// src/module/user/consumer/promocode_create_to_user_after_fulfilled_condition_promotion.consumer.ts
import { AsyncOK, OK } from '#/lib';
import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { PromoCodeSendToUserAfterFulfilledConditionPromotion } from '#user/decorator/promocode_send_to_user_after_fulfilled_condition_promotion.decorator';
import { OrderCreatedEventDto } from '#user/dto/order_created_event.dto';

export async function promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
  PromoCodeCreateToUserAfterFulfilledConditionPromotion,
  orderCommunicator,
  payload,
}: {
  PromoCodeCreateToUserAfterFulfilledConditionPromotion: PromoCodeCreateToUserAfterFulfilledConditionPromotionCtor;
  orderCommunicator: IOrderCommunicator;
  payload: Record<string, unknown>;
}): AsyncOK {
  const parsedPayload = await new OrderCreatedEventDto().act(payload);

  // send promocode via decorator
  await new PromoCodeSendToUserAfterFulfilledConditionPromotion(
    // create promocode
    new PromoCodeCreateToUserAfterFulfilledConditionPromotion(orderCommunicator),
  ).act(parsedPayload);

  return OK;
}
```
Restrict invoke action class  directly from inside
### Action (UseCase)
The main purpose of this layer (`/action`) is glue between external world and domain logic. Action class shouldn't contain context information about invoke like `request/response` (http) or `process.argv` (cli) and etc. This allowing reuse action classes in various scenario of invoke: http, cli, cron job or as consumer handler from message broker. It's forbidden invoke action directly from another action class.

Actions (`/action`) are classes with a single public method `act()`. They may receive cross-module communicators and `Repositories` as constructor parameters (with defaults for DI). Each action also exports a `*Ctor` type alias for using in `*.http|cli|consumer.ts`:
```ts
// src/module/order/action/order_create.action.ts
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { OrderDb, OrderProductRaw } from '#/module/order/repository/order.db';
import { Order, OrderWithCountProducts, OrderWithPrice, OrderWithUpdatedAt, OrderWithUser } from '#/module/order/entity/order.entity';

export class OrderCreate {
  constructor(
    private readonly userCommunicator: IUserCommunicator,
    private readonly orderDb = new OrderDb(),
  ) {}

  async act(orderData: { userId: number; products: OrderProductRaw[] }) {
    return await this.orderDb.create(orderData);
  }
}

export type OrderCreateCtor = typeof OrderCreate;
```

### Decorator
The main purpose of decorator (`/decorator`) to add functional on the top of action class. For example,
dispatch metrics, push notifications, sms or produce data to Kafka/RabbitMQ and etc.
 **Decorator classes**  wrap action class then execute internal logic and pass forward data from method `act` to outside:

```ts
// src/module/order/decorator/after_order_create.decorator.ts
export class AfterOrderCreate {
  constructor(
    private readonly orderCreate: OrderCreate,
    private readonly orderCreateEmailNotify: OrderCreateEmailNotify,
    private readonly orderCreateMetric: OrderCreateMetric,
  ) {}

  async act(orderData: { userId: number; products: OrderProductRaw[] }) {
    const order = await this.orderCreate.act(orderData);
    const user = await order.getUser();

    await Promise.all([
      this.orderCreateEmailNotify.act({ email: user.email, data: { id: order.id, price: order.price, createdAt: order.updatedAt } }),
      this.orderCreateMetric.act({ id: order.id, countProducts: order.countProducts, price: order.price, createdAt: order.updatedAt, userId: user.id }),
    ]);

    // value was pass forward
    return order;
  }
}
```

Example usage:
```ts
// src/module/order/http/order_create.http.ts
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { AfterOrderCreate } from '#order/decorator/after_order_create.decorator';
import { OrderCreateEmailNotify } from '#order/notification/order_create_email.notify';
import { OrderCreateMetric } from '#order/metric/order_create_metric.metric';
import { OrderCreateInputBodyDto, OrderCreateBody } from '#order/dto/order_create_input.dto';

export function orderCreateHttp({
  app,
  OrderCreate,
  userCommunicator,
}: {
  app: FastifyInstance;
  OrderCreate: OrderCreateCtor;
  userCommunicator: IUserCommunicator;
}) {
  app.post<{
    Body: OrderCreateBody;
  }>('/order', async function handler(req, reply) {
    const { user_id: userId, products } = await new OrderCreateInputBodyDto().act(req.body);

    // send email and produce metrics to Kafka after create order
    const order = await new AfterOrderCreate(
      new OrderCreate(userCommunicator),
      new OrderCreateEmailNotify(),
      new OrderCreateMetric())
    .act({
      userId,
      products,
    });

    const user = await order.getUser();

    reply.status(201).send({
      id: order.id,
      price: order.price,
      countProducts: order.countProducts,
      updatedAt: order.updatedAt,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  });
}
```

Generic decorators can wrap any object with an `act()` method using TypeScript generics:
```ts
// src/module/order/decorator/log_input.ts
export class LogInput<T extends { act(...arg: any[]): Promise<any> }> {
  constructor(private readonly obj: T) {}
  async act(...input: Parameters<T['act']>): Promise<ReturnType<T['act']>> {
    console.log('Input ===>', input);
    return await this.obj.act.apply(this.obj, input);
  }
}

// src/module/order/decorator/log_output.ts
export class LogOutput<T extends { act(...arg: any[]): Promise<any> }> {
  constructor(private readonly obj: T) {}
  async act(...input: Parameters<T['act']>): Promise<ReturnType<T['act']>> {
    const result = await this.obj.act.apply(this.obj, input);
    console.log('Output ===>', result);
    return result;
  }
}
```


### Repository
Layer for persist and extract data from different storages ()`/repository`): MySQL, Postgres, Redis, S3, File system, External API and etc. The main task of repository is isolation other application layers from details of storage.
Only this layer known about how load and persist data with sql,http api or use .somehow else.

Example repository (`user.db.ts`) with **Kysely** query builder on PostgreSQL. Each repository creates its own DB connection via `pgConnect.create()`.

```ts
// src/module/user/repository/user.db.ts
import { NotFound } from '#/core/error/not_found.error';
import { SchemaDB, UsersTable } from '#/core/pg/pg.type';
import { pgConnect } from '#/core/pg/pg.instance';
import { Selectable } from 'kysely';

export type UserRow = Selectable<UsersTable>;

export class UserDb {
  protected readonly db: SchemaDB;

  constructor() {
    this.db = pgConnect.create();
  }
  async getById(userId: number): Promise<UserRow> {
    const user = await this.db.selectFrom('users').selectAll().where('id', '=', userId).executeTakeFirst();

    if (!user) {
      throw new NotFound(`User not found with id = ${userId}`);
    }

    return user;
  }
}
```


### Entity
Entity classes (`/entity`) contain core domain logic. It has unique identificator (`id`) for compare between him.
An entity is not just simple class data opposite a class with behavior (Rich Model instead of Anemic Model). And with all this, there are no setters.

For entities with a small number of fields and limited behavior, a single class can be used:
```ts
// src/module/order/entity/order.entity.ts
import { IUserCommunicator } from '#/communicator/user.communicator.type';

export class Order {
  public readonly updatedAt = updatedAt;
  constructor(public readonly id: number, userCommunicator: IUserCommunicator) {}

  async getUser() {
    return userCommunicator.getUserById(userId);
  }

}
```
Entity shouldn't use directly infrastructure. Infrastructure dependencies should be passed via constructor or parameters of method.

But recommendation use **class mixins** for building complexity entity:
```ts
// src/module/order/entity/order.entity.ts
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { OrderProductRaw } from '#order/repository/order.db';

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
```
This approach allows you to build the entity needed in a given specifc place in code.
For example, you can create entity with needed attribute and methods without create "fat" entity () in every place of codebase.
"Fat" entity create performance problem because code loading unused fields from database or any storage into process RAM.

Example usage in action class:
```ts
// src/module/order/action/order_create.action.ts
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { OrderDb, OrderProductRaw } from '#/module/order/repository/order.db';
import { Order, OrderWithCountProducts, OrderWithPrice, OrderWithUpdatedAt, OrderWithUser } from '#/module/order/entity/order.entity';

export class OrderCreate {
  constructor(
    private readonly userCommunicator: IUserCommunicator,
    private readonly orderDb = new OrderDb(),
  ) {}

  async act(orderData: { userId: number; products: OrderProductRaw[] }) {
    const orderRaw = await this.orderDb.create(orderData);

    // build order.entiry with needed fields and methods
    const Order = OrderWithCountProducts(
      OrderWithPrice(
        OrderWithUpdatedAt(OrderWithUser(Order, orderRaw.userId, this.userCommunicator), orderRaw.updatedAt),
        orderRaw.products,
      ),
      orderRaw.products,
    );

    return new Order(orderRaw.id);
  }
}
```

It often doesn't make sense to put behavior for all occasions in one entity (event through a mixin class). You may create some entities:
```ts
// ======== Order (User) in Web/Mobile App ========
export class OrderUser {
  constructor(public readonly id: number) {}
}

export function OrderUserWithCountProducts<TBase extends Constructor>(Base: TBase, products: OrderProductRaw[]) {
  return class extends Base {
    get countProducts() {
      return products.reduce((total, el) => total + el.amount, 0);
    }
  };
}


// ======== Order (Support) in Admin panel ========
export class OrderSupport {
  constructor(public readonly id: number) {}
}

export function OrderWithPrice<TBase extends Constructor>(Base: TBase, products: OrderProductRaw[]) {
  return class extends Base {
    get price() {
      return products.reduce((acc, product) => acc + product.price * product.amount, 0);
    }
  };
}
```


### Value Object
Value objects live in `value_object/` and encapsulate domain logic with behavior.For example, `Money`, `Date`, `ScreenSize`. It's compared by value.

```ts
// src/module/user/value_object/user_promocode.value_object.ts
export class UserPromoCode {
  constructor(
    private readonly user: UserWithEmailInstance,
    public readonly code = this.generatePromocode(),
  ) {}

  private generatePromocode(): string { /* ... */ }

  async sendToUserViaEmail(
    { subject, body }: { subject: string | (() => string); body: (code: string) => string },
    emailClient = new EmailSdk(),
  ) {
    await emailClient.sendText({ email: this.user.email, subject, message: body(this.code) });
  }

  equal(userPromocode: UserPromoCode): boolean {
    return this.code === this.userPromocode.code;
  }
}
```
Value object shouldn't use directly infrastructure. Infrastructure dependencies should be passed via constructor or parameters of method.


### Cross module communication
Modules (example: `user`, `order`) communicate strictly through **communicator interfaces** (`src/communicator/*.communicator.type.ts`). No module directly imports another module's `Actions`, `Repositories`, `Entities`, `Value Of Objects`.

First step, you should declare interface which describe module public api which may use other modules in project:
```ts
// src/communicator/user.communicator.type.ts
export interface IUserCommunicator {
  getUserById(userId: number): Promise<{ id: number; email: string }>;
  existUserWithId(userId: number): Promise<boolean>;
}
```
Second step, you should implement realization of interface:
```ts
// src/module/user/user.communicator.ts
import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { UserGetById } from '#user/action/user_get_by_id.action';
import { UserExistWithId } from '#user/action/user_exist_with_id.action';

export class UserCommunicator implements IUserCommunicator {
  constructor(
    private readonly orderCommunicator: IOrderCommunicator,
    private readonly UserGetByIdCtor = UserGetById,
    private readonly UserExistWithIdCtor = UserExistWithId,
  ) {}

  async getUserById(userId: number) {
    return new this.UserGetByIdCtor(this.orderCommunicator).act({ userId });
  }

  async existUserWithId(userId: number) {
    return new this.UserExistWithIdCtor().act({ userId });
  }
}
```
Class communicator can invoke only `Action` class but can't directly use `Repository`, `Entity` and other layer from module.

Third and final step, add module in app communicator  (`src/communicator.ts`).

The central `AppCommunicator` uses **CommonJS `require()`** via `createCjsRequire` (because esm imports can't sync load module) at property-access time to handle circular dependencies between modules and allow lazy load. Each getter lazily requires the module and wraps the communicator class via `Factory`:

```ts
// src/communicator.ts
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { Factory, createCjsRequire } from '#/lib';

// CommonJS approach to handle circular dependencies via dynamic require()
const _require = createCjsRequire(__filename);

export interface ICommunicator {
  user: IUserCommunicator;
  order: IOrderCommunicator;
}

export class AppCommunicator implements ICommunicator {
  constructor(protected readonly factory = new Factory()) {}

  get user(): IUserCommunicator {
    const { UserCommunicator } = _require('./module/user/user.communicator') as typeof import('./module/user/user.communicator');
    // create fresh instance
    return this.factory.new(UserCommunicator, (Class) => new Class(this.order));
  }

  get order(): IOrderCommunicator {
    const { OrderCommunicator } = _require('./module/order/order.communicator') as typeof import('./module/order/order.communicator');
    // create fresh instance
    return this.factory.new(OrderCommunicator, (Class) => new Class(this.user));
  }
}

export const communicator = new AppCommunicator();
```

~~Communicator implementations (e.g. `src/module/user/user.communicator.ts`) delegate directly to Actions, receiving cross-module communicators via constructor injection.~~

Example usage `user.communicator.ts`:
```ts
//src/module/order/action/order_get_by_id.action.ts
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { OrderDb } from '#order/repository/order.db';

export class OrderGetById {
  constructor(
    private readonly userCommunicator: IUserCommunicator,
    private readonly orderDb = new OrderDb(),
  ) {}

  async act({ orderId }: { orderId: number }) {
    const order = await this.orderDb.getById(orderId);
    const user = await this.userCommunicator.getUserById(order.userId);
    return { id: order.id, user };
  }
}

export type OrderGetByIdCtor = typeof OrderGetById;
```

#### Lifetime
Every call `this.userCommunicator.getUserById` take new instance of `UserCommunicator`:
```ts
this.factory.new(UserCommunicator, (Class) => new Class(this.order));
```
If you want use singleton `UserCommunicator`:
```ts
this.factory.singleton(UserCommunicator, (Class) => new Class(this.order));
```

#### CommonJS
If you project use CommonJS as target module system:
```ts
// Approach with common js:
// Variant 1: Import type then require
import type * as UserCommunicatorModule from './module/user/user.communicator';

get user(): IUserCommunicator {
  const { UserCommunicator } = require('./module/user/user.communicator') as typeof UserCommunicatorModule;
  // Variant 2: require with import type at one moment
  const { UserCommunicator } = require('./module/user/user.communicator') as typeof import('./module/user/user.communicator');

  return this.factory.new(UserCommunicator, (Class) => new Class(this.order));
}
```

### DTO
Input/Output validation uses schemas (example, **Zod**, **TypeBox**) defined in `dto/` per module. Each DTO is a class with a module-level schema and a single `act(body)` method:

#### HTTP
```ts
// src/module/order/dto/order_create_input.dto.ts
import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string(),
  amount: z.number().int().positive(),
  price: z.number().positive(),
});

const schema = z.object({
  user_id: z.number(),
  products: z.array(ProductSchema).min(1),
});

export class OrderCreateInputBodyDto {
  private readonly schema = schema;

  async act(body: unknown) {
    return this.schema.parseAsync(body);
  }
}

// inferred type from schema. You can use for route typing
export type OrderCreateBody = z.infer<typeof schema>;
```

#### CLI
CLI parsing (`parseArgs`) lives in the CLI handler, not the DTO — the DTO receives the already-parsed object:

```ts
// src/module/user/cli/promocode_send_to_users_didnt_make_order_for_too_long.cli.ts
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  args: args.slice(3),
  options: { inactivityDays: { type: 'string', short: 'd' } },
});
const parsedArgs = await new PromoSendInputDto().act(values);
```

### Guard
Authorization guards are instantiated inline in HTTP handlers:

```ts
// src/module/order/guard/user_exist.guard.ts
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { NotFound } from '#/core/error/not_found.error';

export class UserExistGuard {
  constructor(private readonly userCommunicator: IUserCommunicator) {}

  async act(userId: number) {
    if (!(await this.userCommunicator.existUserWithId(userId))) {
      throw new NotFound(`User not found with id = ${userId}`);
    }
  }
}
```

Usage in code
```ts
export function orderCreateHttp({
// ...
}: {
  app: FastifyInstance;
  // ...
}) {
  app.post<{
    Body: OrderCreateBody;
  }>('/order', async function handler(req, reply) {
    // parsing and create DTO

    // Invoke guard
    await new UserExistGuard(userCommunicator).act(userId);

    // Logic...

    reply.status(201).send(data);
  });
}
```

Guards throw `AppError` subclasses (e.g. `NotFound`) on failure, which are caught by Fastify's error handler.

## Entry point
The application has three entry points — one per runtime mode: HTTP server, CLI runner, and Kafka consumer. They are invoked directly (`node` + `import.meta.url` guard) and share the same module structure.

### HTTP
Creates a http server (**Fastify**) with route registration and error handling.

```ts
// src/http.ts

import { fileURLToPath } from 'node:url';
import Fastify, { FastifyInstance } from 'fastify';

import { AppError } from '#/core/error/app.error';
import { mountUserRoutes } from '#user/user.http.router';
import { mountOrderRoutes } from '#order/order.http.router';

import { communicator } from '#/communicator';

export const appErrorLogger = {
  error: console.error,
};

export function createApp() {
  const app = Fastify();
  setupErrorHandler(app);

  return app;
}

// Register routes
function mountRoutes(app: FastifyInstance) {
  // pass communicator
  mountUserRoutes({ app, orderCommunicator: communicator.order });
  mountOrderRoutes({ app, userCommunicator: communicator.user });

  return app;
}

function setupErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    appErrorLogger.error(error);
    if (error instanceof AppError) {
      error.pipeTo(reply);
    } else {
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
}

function startServer(app: FastifyInstance) {
  app.listen({ port: 4005, host: '0.0.0.0' }, async function (err, address) {
    if (err) {
      throw err;
    }
    console.log('Server was started ' + address);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer(mountRoutes(createApp()));
}

```

`createApp()` is exported separately so middle-level tests can use `Fastify.inject()` without starting a real server. Routes are mounted statically at import time.

### CLI
Runs **named jobs** (manual or cron) using `parseArgs` from `node:util`.

```ts
// src/cli.ts
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { AsyncOK } from '#/lib';
import { orderJobs } from '#/module/order/order.cli.router';
import { userJobs } from '#/module/user/user.cli.router';

// Register jobs from modules
const jobs: Record<string, () => AsyncOK> = {
  ...orderJobs,
  ...userJobs,
};

export async function invokeCommand(args: string[] = process.argv) {
  const { positionals } = parseArgs({
    args: args.slice(2),
    allowPositionals: true,
    strict: false, // Prevent throwing on unknown options meant for the job
  });

  const taskName = positionals[0];

  if (!taskName) {
    console.error('Task name is required');
    process.exit(1);
  }

  const job = jobs[taskName];

  if (!job) {
    throw new Error(`Task ${taskName} not found`);
  }

  await job();
}

async function runCli() {
  try {
    await invokeCommand();

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli();
}
```
Jobs are registered in `*.cli.router.ts` files and merged into a single `Record<string, () => AsyncOK>`. Each job entry uses **dynamic `import()`** for lazy loading.

```sh
# Run a CLI job (dev)
$ npx tsx src/cli.ts orderSuccessArchive --date 2024-01-01T12:00:00.000Z
```

### Consumer
```ts
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { Kafka, EachMessagePayload } from 'kafkajs';
import { ConsumerDescriptor } from '#/lib';
import { userConsumers } from '#/module/user/user.consumer.router';

// Register consumers
const consumers: ConsumerDescriptor[] = [...userConsumers];

export async function startConsumer(args: string[] = process.argv): Promise<void> {
  const { positionals } = parseArgs({
    args: args.slice(2),
    allowPositionals: true,
    strict: false,
  });

  const consumerName = positionals[0];

  if (!consumerName) {
    console.error('Consumer name is required');
    process.exit(1);
  }

  const entry = consumers.find((c) => c.name === consumerName);

  if (!entry) {
    throw new Error(`Consumer ${consumerName} not found`);
  }

  const kafka = new Kafka({
    clientId: 'koloss-consumer',
    brokers: [process.env.KAFKA_BROKER || '127.0.0.1:9092'],
  });

  const groupConsumer = kafka.consumer({ groupId: `koloss-consumer-${entry.name}` });
  await groupConsumer.connect();

  await groupConsumer.subscribe({ topic: entry.topic, fromBeginning: false });
  console.log(`Subscribed to topic: ${entry.topic}`);

  await groupConsumer.run({
    eachMessage: async ({ topic, message }: EachMessagePayload) => {
      const payload = JSON.parse(message.value!.toString()) as Record<string, unknown>;

      try {
        await entry.handler(payload);
      } catch (error) {
        console.error(`Handler for topic ${topic} failed:`, error);
      }
    },
  });

  console.log(`### Consumer ${entry.name} started ####\n\n`);

  await new Promise<void>((resolve) => {
    const shutdown = async () => {
      console.log('Shutting down consumer...');
      await groupConsumer.disconnect();
      resolve();
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  });
}

async function runConsumer() {
  try {
    await startConsumer();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runConsumer();
}
```

Connects to **Kafka** via `kafkajs` and runs a named consumer indefinitely.
```
startConsumer(args) — Parses positional arg[0] as consumer name,
                      matches against ConsumerDescriptor[], subscribes to topic,
                      runs eachMessage handler
```

```sh
# Run a consumer (dev)
$ npx tsx src/consumer.ts promoCodeSendToUserAfterFulfilledConditionPromotion
```


## Don't use services
There are **no generic Service classes**. Each concern is a **concrete class** with a single `act()` method:
- `OrderCreateEmailNotify` — sends email
- `OrderCreateMetric` — publishes to Kafka
- `OrderSuccessArchive` — archives orders

These are orchestrated by **Decorator** classes. Metrics and notification live in `metric/` and `notification/` subdirectories per module.

## Shared code

- **`src/lib.ts`** — The `Factory` class creates proxy objects where every method call creates a **fresh instance** of the class (per-call instantiation). Use `factory.singleton()` to cache instances. Exports `OK = { ok: true } as const`, `SyncOK` (type), and `AsyncOK` (type).
- **`src/lib_test.ts`** — Test helpers: `createMockClass()`, `createFunctionStub()`, `createClassStub()`, `overridePropsOfObject()`, and the `StubPropOfInstance<InputClass>` type.
- **`src/core/error/`** — `AppError` hierarchy with `pipeTo(FastifyReply)`, `getHttpCode()`, `toJSON()`. Includes `NotFound`.
- **`src/core/pg/`** — `PgConnect` (Kysely + pg Pool singleton), Kysely table types.
- **`src/core/kafka/`** — `KafkaClient` / `KafkaProducer` singleton wrappers.
- **`src/core/email/`** — `EmailClient` / `EmailSdk` (stub that logs to console).

## Test
Fake approach
```ts
// test/fake/communicator.ts
import { AppCommunicator } from '#/communicator';
import { UserCommunicatorFake } from '#test/fake/module/user/user.communicator';
import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { OrderCommunicatorFake } from '#test/fake/module/order/order.communicator';

export class AppCommunicatorFake extends AppCommunicator {
  private readonly UserCommunicator: typeof UserCommunicatorFake;
  private readonly OrderCommunicator: typeof OrderCommunicatorFake;

  constructor({
    UserCommunicatorCtor,
    OrderCommunicatorCtor,
  }: {
    UserCommunicatorCtor?: typeof UserCommunicatorFake;
    OrderCommunicatorCtor?: typeof OrderCommunicatorFake;
  } = {}) {
    super();

    this.UserCommunicator = UserCommunicatorCtor || UserCommunicatorFake;
    this.OrderCommunicator = OrderCommunicatorCtor || OrderCommunicatorFake;
  }
  get user() {
    return this.factory.new(this.UserCommunicator, (Class) => new Class(this.order));
  }

  get order(): IOrderCommunicator {
    return this.factory.new(this.OrderCommunicator, (Class) => new Class(this.user));
  }
}
```

### Low level
**Pure unit tests** (`test/low_level/`). No DB, no external services. Inject `AppCommunicatorFake` (returns canned responses) and `*DbInMemoryFake` (extends real DB with in-memory arrays). Fakes extend the real class and use in-memory storage for tests (TODO: add information repository).

```ts
// test/low_level/module/order/action/order_get_by_id.action.test.ts
import { OrderGetById } from '#/module/order/action/order_get_by_id.action';
import { OrderDbInMemoryFake } from '#test/fake/module/order/repository/order.db.in_memory.fake';
import { OrderRaw } from '#/module/order/repository/order.db';
import { UserDbInMemoryFake } from '#test/fake/module/user/repository/user.db.in_memory.fake';
import { AppCommunicatorFake } from '#test/fake/communicator';

describe('OrderGetById', () => {
  it('should return an order with user information', async () => {
    const orderId = 1;
    const order: OrderRaw = {
      id: orderId,
      userId: UserDbInMemoryFake.defaultUser.id,
      products: [],
      price: 0,
      status: 'pending',
      updatedAt: new Date(),
    };

    const userCommunicator = new AppCommunicatorFake().user;
    const orderDb = new OrderDbInMemoryFake({ orders: [order] });

    const orderGetById = new OrderGetById(userCommunicator, orderDb);
    const result = await orderGetById.act({ orderId });

    expect(result.id).toBe(orderId);
    expect(result.user.id).toBe(UserDbInMemoryFake.defaultUser.id);
  });
});
```

In memory implementation of repository:
```ts
// test/fake/module/order/repository/order.db.in_memory.fake.ts
import { OrderDb, OrderRaw, OrderProductRaw } from '#/module/order/repository/order.db';
import { UserDbInMemoryFake } from '#test/fake/module/user/repository/user.db.in_memory.fake';
import { Order, OrderWithPrice } from '#/module/order/entity/order.entity';
import { overridePropsOfObject, StubPropOfInstance } from '#/lib_test';

export class OrderDbInMemoryFake extends OrderDb {
  static readonly defaultOrder: OrderRaw = {
    id: 1,
    userId: UserDbInMemoryFake.defaultUser.id,
    products: [{ name: 'Apple', amount: 1, price: 10 }],
    price: 10,
    status: 'completed',
    updatedAt: new Date(),
  };

  private _orders: OrderRaw[] = [OrderDbInMemoryFake.defaultOrder];

  constructor({ stubs, orders }: { stubs?: StubPropOfInstance<typeof OrderDbInMemoryFake>; orders?: OrderRaw[] } = {}) {
    super();

    this._orders = orders ?? [OrderDbInMemoryFake.defaultOrder];

    overridePropsOfObject(this, stubs || {});
  }

  async getById(orderId: number): Promise<OrderRaw> {
    const order = this._orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error(`Not found order with id: ${orderId}`);
    }
    return order;
  }
}
```

### Middle level
**Super Lightweight integration tests** (`test/middle_level/`) with real Database (for example, PostgreSQL via Docker). Other service (Kafka, Email, API) are auto-mocked via `jest.mock()` in `test/jest/setup.ts`. Uses [pg-transactional-tests](https://github.com/romeerez/pg-transactional-tests), [mysql-transactional-tests](https://www.npmjs.com/package/mysql-transactional-tests) for run test in isoaltion transaction (`testTransaction.start()` / `testTransaction.rollback()`). `Fastify.inject()` uses for HTTP testing without a real http server.

Covers HTTP, CLI, and consumer handlers:
- `test/middle_level/module/${module_name}/http/` — HTTP integration tests
- `test/middle_level/module/${module_name}/cli/` — CLI integration tests
- `test/middle_level/module/${module_name}/consumer/` — Consumer integration tests

Example test for http:
```ts
// test/middle_level/module/order/http/order_create.http.test.ts
import { orderCreateHttp } from '#/module/order/http/order_create.http';
import { OrderCreate } from '#/module/order/action/order_create.action';
import { UserCommunicatorFake } from '#test/fake/module/user/user.communicator';
import { createApp } from '#/http';
import { AppError } from '#/core/error/app.error';
import { NotFound } from '#/core/error/not_found.error';
import { createMockClass } from '#/lib_test';
import { kafkaInstance } from '#/core/kafka/kafka_client.instance';
import { emailClientInstance } from '#/core/email/email_client.instance';
import { AppCommunicatorFake } from '#test/fake/communicator';
import { FastifyInstance } from 'fastify';
import { pgConnect } from '#/core/pg/pg.instance';
import { testTransaction } from 'pg-transactional-tests';
import { OrderDbFake } from '#test/fake/module/order/repository/order.db.fake';

describe('HTTP Order Create', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = createApp();
    await pgConnect.rebuild();
    await testTransaction.start();
  });

  afterEach(async () => {
    app.close();
    await testTransaction.rollback();
  });

  afterAll(async () => {
    await pgConnect.destroy();
  });

  it('should create an order and return 201', async () => {
    const products = [
      { name: 'Banana', amount: 4, price: 10 },
      { name: 'Milk', amount: 32, price: 20 },
    ];

    const orderDb = new OrderDbFake();

    const countBefore = Number(await orderDb.countAll());

    orderCreateHttp({
      app,
      OrderCreate,
      userCommunicator: new AppCommunicatorFake().user,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/order',
      payload: {
        user_id: 1234,
        products,
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();

    expect(body.id).toEqual(expect.any(Number));
    expect(body.price).toBe(680);
    expect(body.countProducts).toBe(36);
    expect(body.user.id).toBe(1234);
    expect(body.updatedAt).toBeDefined();

    const countAfter = Number(await orderDb.countAll());
    expect(countAfter).toBe(countBefore + 1);

    expect(kafkaInstance.send).toHaveBeenCalledTimes(1);
    expect(emailClientInstance.dispatch).toHaveBeenCalledTimes(1);

    expect(kafkaInstance.send).toHaveBeenCalledWith('order_metrics', {
      key: String(body.id),
      value: JSON.stringify({
        id: body.id,
        price: body.price,
        countProducts: body.countProducts,
        createdAt: new Date(body.updatedAt),
        userId: body.user.id,
      }),
    });

    expect(emailClientInstance.dispatch).toHaveBeenCalledWith('test@example.com', expect.any(String), expect.any(String));
  });

  it('should return 404 if user is not found', async () => {
    const userId = 9999; // Non-existent user ID
    const products = [
      { name: 'Banana', amount: 4, price: 10 },
      { name: 'Milk', amount: 32, price: 20 },
    ];

    const orderDb = new OrderDbFake();
    const countBefore = Number(await orderDb.countAll());

    const UserCommunicatorCtor = createMockClass(UserCommunicatorFake, { existUserWithId: async (id: number) => id !== userId });

    orderCreateHttp({
      app,
      OrderCreate,
      userCommunicator: new AppCommunicatorFake({ UserCommunicatorCtor }).user,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/order',
      payload: {
        user_id: userId,
        products,
      },
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body) as AppError;
    expect(body.code).toBe(new NotFound('').code);

    const countAfter = Number(await orderDb.countAll());
    expect(countAfter).toBe(countBefore);
  });
});

```


### Up level
**Not yet implemented**. Planned: TestContainers, real HTTP servers, minimum stubs.

# Architecture Decisions

## Loading modules
Async loading module not supported because `require` uses `Proxy` that decreases performance (code can't extract information about method). Instead, the app uses synchronous CommonJS `require()` via `createRequire` for lazy module loading. A Proxy-based alternative (`src/communicator_proxy_version.ts`) demonstrates the trade-off.

- **HTTP**: Modules loaded statically at import time. Communicator lazily resolves cross-module dependencies on first property access.
- **CLI**: Named job entries use dynamic `import()` to lazy-load the CLI handler and Action files only when invoked.
- **Consumer**: Handler functions use dynamic `import()` to load consumer logic.

## Entity composition via mixins
Entities are stateless class-factory functions that return anonymous classes extending a base. Each entity is composed at the Action level with the exact data it needs — no ORM involved.

## Value objects with behavior
Domain concepts that combine data with logic (e.g., promo code generation and email delivery) live in `value_object/`. They are instantiated by Actions or Decorators and encapsulate business rules without needing their own repository or use case.

## Per-call instantiation
The `Factory` class creates proxy objects where every method call gets a **fresh instance** of the class. This is the default. Use `factory.singleton()` for caching. There is no DI container.

## Communicators are the only cross-module API
All cross-module access goes through communicator interfaces. No module directly imports another module's internals.

# TODO
* Integration view (server render jsx)
* Integration async background task (consumer pattern is partially implemented via Kafka)
