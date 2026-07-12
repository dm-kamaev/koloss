http.dev:
	npx tsx src/entry/http.ts

# make cli args="orderSuccessArchive --date 2024-01-01T12:00:00.000Z"
# make cli args="promoCodeSendToUsersDidntMakeOrderForTooLong --inactivityDays 30"
args=
cli.dev:
	npx tsx src/entry/cli.ts $(args)

cli:
	docker compose exec backend node --enable-source-maps dist/src/entry/cli.js $(args)

# make consumer.dev args="promoCodeSendToUserAfterFulfilledConditionPromotion"
consumer.dev:
	npx tsx src/entry/consumer.ts $(args)

# make consumer args="promoCodeSendToUserAfterFulfilledConditionPromotion"
consumer:
	docker compose exec backend node --enable-source-maps dist/src/entry/consumer.js $(args)


check_ts:
	npx tsc --noEmit

lint:
	npx eslint src/ test/

build: check_ts
	rm -rf dist;
	npx tsc


service=
down:
	docker compose $(if $(service), rm -sf $(service), down)

log:
	docker compose logs -f --tail 100 | sed -u 's/^[^|]*[^ ]* //';

file=
test:
	docker compose run --remove-orphans backend_dev npx jest $(file)

up:
	docker compose up --remove-orphans -d backend

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

.PHONY: test test.watch test.coverage build check_ts lint down up
