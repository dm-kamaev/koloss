check_ts:
	npx tsc --noEmit

build: check_ts
	rm -rf dist;
	npx tsc

create_user:
	curl -X POST http://127.0.0.1:4005/user  -H "Content-Type: application/json" \
	 -d '{ "first_name": "Ivan", "last_name": "Ivanov"}' \
	 | jq

user_id=
get_user:
	echo "$(user_id)";
	curl -X GET http://127.0.0.1:4005/user/$(user_id) | jq

create_order:
	curl -X POST http://127.0.0.1:4005/order  -H "Content-Type: application/json" \
	-d '{ "user_id": 534, "products": [{"id": 1, "price": 2.80, "quantity": 5, "weight": 2.25},{"id": 12, "price": 102.5, "quantity": 5, "weight": 0.3}]}' \
	| jq

get_all_order:
	curl -X GET http://127.0.0.1:4005/order | jq

.PHONY: test