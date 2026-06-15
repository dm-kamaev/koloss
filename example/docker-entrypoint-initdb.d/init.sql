DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS order_status;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

INSERT INTO users (id, name, last_name, email) VALUES
(1234, 'Vasya', 'Ivanov', 'test@example.com'),
(1, 'John', 'Doe', 'john.doe@example.com'),
(2, 'Jane', 'Doe', 'jane.doe@example.com');

-- Reset sequence for auto-incrementing IDs after manual insertion
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));


CREATE TYPE order_status AS ENUM ('pending', 'completed', 'archived');

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    products JSONB,
    price DECIMAL(10, 2),
    status order_status,
    updated_at TIMESTAMP
);

INSERT INTO orders (id, user_id, products, price, status, updated_at) VALUES
(1, 1234, '[{"name": "Apple", "amount": 1, "price": 10}]', 10, 'completed', NOW() - INTERVAL '1 day'),
(2, 1234, '[{"name": "Orange", "amount": 2, "price": 20}]', 40, 'pending', NOW()),
(3, 2, '[{"name": "Banana", "amount": 3, "price": 5}]', 15, 'completed', NOW()),
(4, 1, '[{"name": "Milk", "amount": 4, "price": 15}]', 60, 'archived', NOW() - INTERVAL '1 day');

SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));
