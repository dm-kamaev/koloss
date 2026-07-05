http.dev:
	npx tsx src/http.ts

# make cli args="orderSuccessArchive --date 2024-01-01T12:00:00.000Z"
# make cli args="promoCodeSendToUsersDidntMakeOrderForTooLong --inactivityDays 30"
args=
cli.dev:
	npx tsx src/cli.ts $(args)

cli:
	docker compose exec backend node --enable-source-maps dist/src/cli.js $(args)

# make consumer.dev args="order_metrics"
consumer.dev:
	npx tsx src/consumer.ts $(args)

# make consumer args="order_metrics"
consumer:
	docker compose exec backend node --enable-source-maps dist/src/consumer.js


check_ts:
	npx tsc --noEmit


build: check_ts
	rm -rf dist;
	npx tsc && npx tsc-alias


service=
down:
	docker compose $(if $(service), rm -sf $(service), down)


file=
test:
	docker compose run --remove-orphans backend_dev npx jest $(file)

up:
	docker compose up -d backend

up.watch:
	docker compose up backend


test.watch:
	docker compose run --remove-orphans backend_dev npx jest $(file) --watchAll


test.coverage:
	docker compose run --remove-orphans backend_dev npx jest --coverage

# test:middle:
# 	docker-compose run backend npx jest --verbose test/middle_level

# test:middle.watch:
# 	docker-compose run backend npx jest --verbose --watchAll test/middle_level


# ================== API ==================
# make api.user_get user_id=1234
user_id=
api.user_get:
	echo "$(user_id)";
	curl -X GET http://127.0.0.1:4005/user/$(user_id) | jq


api.order_create:
	curl -X POST http://127.0.0.1:4005/order  -H "Content-Type: application/json" \
	-d '{ "user_id": 1234, "products": [{ "name": "Banana", "amount": 4, "price": 10 }, { "name": "Milk", "amount": 32, "price": 20 }]}' \
	| jq

order_id=
api.order_get:
	curl -X GET http://127.0.0.1:4005/order/$(order_id) | jq

# ================== END API ==================

.PHONY: test test.watch test.coverage build check_ts down up
