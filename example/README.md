# Koloss

This is a **template project**. Use it as a reference and starting point for building other projects with the `koloss` approach.

## Layers
Every module (e.g. `src/module/user/`, `src/module/order/`) follows this structure:
```
action/       — Use cases (classes with act() method)
entity/       — Domain entities via mixin composition
repository/   — DB access (Kysely on PostgreSQL)
http/         — Fastify route handlers per action
cli/          — CLI handlers per action
decorator/    — Cross-cutting concerns (side effects, logging)
guard/        — Authorization checks
metric/       — Kafka metrics publishing
notification/ — Email side effects
*.communicator.ts     — Public API for cross-module calls
*.http.router.ts      — Route registration
*.cli.router.ts       — Command registration
*.consumer.router.ts  — Kafka consumer registration
```

### HTTP, CLI, Consumer and etc

#### HTTP
Each HTTP handler is a **factory function** that receives `{ app, ActionCtor, communicator? }` and registers a Fastify route. Routers collect all handlers within a module:

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

Handler route `POST /order`:
```ts
// src/module/order/http/order_create.http.ts
import type { FastifyInstance } from 'fastify';
import { OrderCreateCtor } from '#/module/order/action/order_create.action';
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { z } from 'zod';
import { UserExistGuard } from '#order/guard/user_exist.guard.js';
import { OrderCreateInputBodyDto } from '#order/dto/order_create_input.dto.ts';


type OrderCreateBody = z.infer<typeof OrderCreateInputBodyDto>;

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
    const { user_id: userId, products } = await OrderCreateInputBodyDto.parseAsync(req.body);

    await new UserExistGuard(userCommunicator).act(userId);

    const order = await new OrderCreate(userCommunicator).act({
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

#### CLI


#### Consumer

### Action (UseCase)
Actions are classes with a single (pubic) `act()` method. They may receive cross-module communicators and DB classes as constructor parameters (with defaults for DI). Each action also exports a `*Ctor` type alias:

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
Side effects (dispatch data, metrics, notifications) are implemented as **Decorator classes** that wrap Actions. Decorators call the wrapped action and run side effects after:

```ts
// src/module/order/decorator/after_order_create.decorator.ts
export class AfterOrderCreate {
  constructor(
    private readonly orderCreate: OrderCreate,
    private readonly orderCreateEmailNotify: OrderCreateEmailNotify,
    private readonly orderCreateMetric: OrderCreateMetric,
  ) {}
  async act(orderData) {
    const order = await this.orderCreate.act(orderData);
    await Promise.all([
      this.orderCreateEmailNotify.act({ ... }),
      this.orderCreateMetric.act({ ... }),
    ]);
    return order;
  }
}
```
Decorators return original data to ensure approach with nested invoke


```ts
// add example
```


### Repository
Layer for storage access (MySQL, Postgres, Redis, S3, file system and etc).
For example with  **Kysely** query builder on PostgreSQL. Each repository creates its own DB connection via `pgConnect.create()`. Fakes extend the real class and use in-memory storage for tests.

```ts
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
Entities use **class mixins** — function-based composition with no ORM. A base class is extended through chained mixin functions:

```ts
const OrderEntity = OrderWithCountProducts(
  OrderWithPrice(OrderWithUpdatedAt(OrderWithUser(Order, userId, userCommunicator), updatedAt)),
  products,
);
```

### Cross module communication
Modules (`user`, `order`) communicate strictly through **communicator interfaces** (`src/communicator/*.communicator.type.ts`). No module directly imports another module's Actions, Repositories, or Entities.

```ts
// src/communicator/user.communicator.type.ts
export interface IUserCommunicator {
  getUserById(userId: number): Promise<{ id: number; email: string }>;
  existUserWithId(userId: number): Promise<boolean>;
}
```

Class communicator can invoke only action class but can't directly use repository, entity and other code.
```ts
// src/module/user/user.communicator.ts
import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { UserGetById } from '#user/action/user_get_by_id.action.js';
import { UserExistWithId } from '#user/action/user_exist_with_id.action.js';

export class UserCommunicator implements IUserCommunicator {
  constructor(
    private readonly orderCommunicator: IOrderCommunicator,
    private readonly UserGetByIdCtor = UserGetById,
    private readonly UserExistWithIdCtor = UserExistWithId,
  ) {}

  /**
   * * throw error if user not found
   */
  async getUserById(userId: number) {
    return new this.UserGetByIdCtor(this.orderCommunicator).act({ userId });
  }

  async existUserWithId(userId: number) {
    return new this.UserExistWithIdCtor().act({ userId });
  }
}
```

The central `AppCommunicator` (`src/communicator.ts`) uses **CommonJS `require()`** (via `createRequire`) at property-access time to handle circular dependencies between modules. Each getter lazily requires the module and wraps the communicator class via `Factory`:

```ts
get user(): IUserCommunicator {
  const { UserCommunicator } = _require('./module/user/user.communicator');
  return this.factory.new(UserCommunicator, (Class) => new Class(this.order));
}
```

Communicator implementations (e.g. `src/module/user/user.communicator.ts`) delegate directly to Actions, receiving cross-module communicators via constructor injection.

### DTO (optional)
Input/Output validation uses schemas (**Zod** or **TypeBox**), defined inline in HTTP handlers, CLI parsing.

```ts
// src/module/order/dto/order_create_input.dto.ts
const ProductSchema = z.object({
  name: z.string(),
  amount: z.number().int().positive(),
  price: z.number().positive(),
});

const OrderCreateInputBodyDto = z.object({
  user_id: z.number(),
  products: z.array(ProductSchema).min(1),
});
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

## Don't use services
There are **no generic Service classes**. Each concern is a **concrete class** with a single `act()` method:
- `OrderCreateEmailNotify` — sends email
- `OrderCreateMetric` — publishes to Kafka
- `OrderSuccessArchive` — archives orders

These are orchestrated by **Decorator** classes. Metrics and notification live in `metric/` and `notification/` subdirectories per module.

## Shared code

- **`src/lib.ts`** — The `Factory` class creates proxy objects where every method call creates a **fresh instance** of the class (per-call instantiation). Use `factory.singleton()` to cache instances. Also exports `OK = { ok: true }`.
- **`src/lib_test.ts`** — Test helpers: `createMockClass()`, `createFunctionStub()`, `createClassStub()`, `overridePropsOfObject()`.
- **`src/core/error/`** — `AppError` hierarchy with `pipeTo(FastifyReply)`, `getHttpCode()`, `toJSON()`. Includes `NotFound`.
- **`src/core/pg/`** — `PgConnect` (Kysely + pg Pool singleton), Kysely table types.
- **`src/core/kafka/`** — `KafkaClient` / `KafkaProducer` singleton wrappers.
- **`src/core/email/`** — `EmailClient` / `EmailSdk` (stub that logs to console).

## Test

### Low level

**Pure unit tests** (`test/low_level/`). No DB, no external services. Inject `AppCommunicatorFake` (returns canned responses) and `*DbInMemoryFake` (extends real DB with in-memory arrays).

```ts
const userCommunicator = new AppCommunicatorFake().user;
const orderDb = new OrderDbInMemoryFake();
const orderCreate = new OrderCreate(userCommunicator, orderDb);
const orderEntity = await orderCreate.act(orderData);
```

### Middle level

**Integration tests** (`test/middle_level/`) with real PostgreSQL via Docker. Kafka and email are auto-mocked via `jest.mock()` in `test/jest/setup.ts`. Uses `pg-transactional-tests` (`testTransaction.start()` / `testTransaction.rollback()`) for rollback isolation, `pgConnect.rebuild()` before each test, and `Fastify.inject()` for HTTP testing without a real server.

### Up level

**Not yet implemented**. Planned: TestContainers, real HTTP servers, minimum stubs.

# Architecture Decisions

## Loading modules

Async loading module not supported because `require` uses `Proxy` that decreases performance (code can't extract information about method). Instead, the app uses synchronous CommonJS `require()` via `createRequire` for lazy module loading, and dynamic `import()` in CLI/consumer handlers.

- **HTTP**: Modules loaded statically at import time. Communicator lazily resolves cross-module dependencies on first property access.
- **CLI**: Named job entries use dynamic `import()` to lazy-load the CLI handler and Action files only when invoked.
- **Consumer**: Handler functions use dynamic `import()` to load consumer logic.

## Entity composition via mixins

Entities are stateless class-factory functions that return anonymous classes extending a base. Each entity is composed at the Action level with the exact data it needs — no ORM involved.

## Per-call instantiation

The `Factory` class creates proxy objects where every method call gets a **fresh instance** of the class. This is the default. Use `factory.singleton()` for caching. There is no DI container.

## Communicators are the only cross-module API

All cross-module access goes through communicator interfaces. No module directly imports another module's internals.

# TODO

* Integration view (server render jsx)
* Integration async background task
