-- ============================================================
-- Jenkins Docker CI/CD Demo
-- MySQL Database Initialization
-- ============================================================

CREATE DATABASE IF NOT EXISTS cicd_demo;

USE cicd_demo;

-- ------------------------------------------------------------
-- Products table
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Sample data
-- ------------------------------------------------------------

INSERT INTO products (name, price, description)
VALUES
    ('Laptop', 75000.00, 'Development laptop'),
    ('Mechanical Keyboard', 4500.00, 'Mechanical RGB keyboard'),
    ('Wireless Mouse', 1500.00, 'Wireless ergonomic mouse'),
    ('USB-C Hub', 2500.00, 'Multi-port USB-C hub'),
    ('Headphones', 3500.00, 'Wireless headphones');

-- ------------------------------------------------------------
-- Verify data
-- ------------------------------------------------------------

SELECT * FROM products;