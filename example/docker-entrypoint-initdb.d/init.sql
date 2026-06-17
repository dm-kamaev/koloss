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
(1234, 'Vasya', 'Ivanov', 'test@example.com');

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
