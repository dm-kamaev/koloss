# Koloss / mediator-r

## Repository structure

This is a monorepo with two packages:

- **Root** (`package.json` name `koloss_js`): The `mediator-r` npm library — CQS/CQRS in TypeScript.  
  Entry: `src/index.ts` exports `RegistryComposer` + `GetLazy`. No tests exist for the library itself.

- **`example/`**: A reference app (Fastify + PostgreSQL + Kafka) demonstrating the library with a real architecture. Most development work happens here.  
  Entry: `example/src/http.ts` (HTTP server on port 4005), `example/src/cli.ts` (CLI runner).

## Commands (root)

| Command | Action |
|---|---|
| `make check_ts` | Type-check without emitting (`tsc --noEmit`) |
| `make build` | `check_ts` → `rm -rf dist` → `tsc` |
| `make publish` | `npm publish --access public` |
| `npm test` | Fails intentionally — no tests for the library |

## Commands (example/)

Run from `example/` directory:

| Command | Action |
|---|---|
| `make http.dev` | Start dev HTTP server via `npx tsx src/http.ts` |
| `make cli.dev args="..."` | Run CLI command via `npx tsx src/cli.ts ...` |
| `make build` | `check_ts` → `rm -rf dist` → `tsc && tsc-alias` |
| `make up` / `make up.watch` | Start services (docker compose) / foreground |
| `make down service=<name>` | Tear down services |
| `make test` | Run all tests in docker: `docker compose run backend_dev npx jest` |
| `make test file=<path>` | Single test file |
| `make test.watch file=<path>` | Watch mode |
| `make test.coverage` | Coverage report |
| `make api.user_get user_id=1234` / `make api.order_create` / `make api.order_get order_id=` | Curl helpers against `http://127.0.0.1:4005` |

## Architecture

### Module structure
Each module (e.g. `src/module/user/`, `src/module/order/`) follows this layering:

```
action/       — Use cases (classes with `act()` method)
entity/       — Domain entities via mixin composition (class factory functions)
repository/   — DB access (Kysely on PostgreSQL)
http/         — Fastify route handlers per action
cli/          — CLI handlers per action
decorator/    — Cross-cutting concerns
guard/        — Authorization
metric/, notification/ — Side effects
*.communicator.ts — Public API for cross-module calls
*.http_router.ts / *.cli_router.ts — Route/command registration
```

### Cross-module communication
Modules communicate strictly through **communicator interfaces** (`src/communicator/*.communicator.type.ts`). `AppCommunicator` (`src/communicator.ts`) lazily requires modules using `require()` to handle circular dependencies. The `Factory` class (in `src/lib.ts`) creates per-call instances — not singletons by default. Use `factory.singleton()` to cache.

### DI pattern
`Factory.new(Class, createInstance)` — wraps all prototype methods to create a fresh instance per method call. The `createMockClass` helper (`src/lib_test.ts`) supports dependency injection for tests by stubbing prototype methods before Factory creates instances.

### Entity pattern
Entities use class mixins (function returning an anonymous class extending a base):
```ts
UserWithOrdersCount(UserWithEmail(User, email), count)
```

### Error handling
Custom `AppError` hierarchy in `src/core/error/`. Has `pipeTo(FastifyReply)` and `getHttpCode()` methods. Fastify error handler in `src/http.ts` uses `appErrorLogger.error`.

## Testing

Three tiers in `test/`:

| Tier | Directory | DB | Mocks | Description |
|---|---|---|---|---|
| Low | `test/low_level/` | In-memory fakes | Everything | Pure unit tests |
| Middle | `test/middle_level/` | Real PostgreSQL (docker) | Kafka, email | `pg-transactional-tests` for rollback isolation |
| Up | `test/up_level/` | — | — | Not yet implemented |

### Test patterns
- Low-level tests inject `*InMemoryFake` classes from `test/fake/` (e.g., `OrderDbInMemoryFake`, `UserDbInMemoryFake`)
- Middle-level tests use `testTransaction.start()` / `testTransaction.rollback()` with real PG. `pgConnect.rebuild()` is called before each test
- Middle-level tests use `AppCommunicatorFake` (from `test/fake/communicator.ts`) to stub communicators
- Kafka and email are auto-mocked via `jest.mock()` in `test/jest/setup.ts`
- Tests match pattern `**/test/**/*.test.ts`
- Use `createMockClass(OriginalClass, { methodName: stubFn })` to override specific methods while keeping others real

### Test DB setup
Requires Docker with PostgreSQL. DB credentials (from `docker-compose.yaml`): `koloss/example@pg:5432/koloss`. Schema is bootstrapped by `docker-entrypoint-initdb.d/init.sql`.

## Key config facts

- **Path aliases** (via `tsconfig.json` paths + `tsc-alias`): `@/` → `src/`, `@test/` → `test/`, `@order/*`, `@user/*`
- **Jest preset**: `ts-jest/presets/js-with-ts` (required because Kysely ships JS files)
- **Transform ignore**: `node_modules/(?!kysely/)` — Kysely must be transpiled
- **Prettier**: 140 print width, single quotes, trailing commas all
- **ESLint**: Enforces `new` with throw (`new-with-error`), `unused-imports/` (auto-fix), no `any`-related warnings, `_`-prefixed vars ignored for unused
- **`.npmrc`**: `save-exact=true`
- **CI** (root): Node 14, `npm i -D`, `make build` — quite old, update expected
