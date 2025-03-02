-- Drop existing tables if needed
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'premium', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_role ON users(role);

-- Insert default admin user (password harus di-hash)
INSERT INTO users (name, email, password, role) 
VALUES ('Admin', 'admin@example.com', '$2a$12$yourhashpassword', 'admin');

-- Update specific user to admin (ganti email sesuai user yang ingin dijadikan admin)
UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';