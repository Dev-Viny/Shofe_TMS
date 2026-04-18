-- Database Schema for Haulage Truck Management System
-- Run this in phpMyAdmin or MySQL command line

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS haulage_truck_management;
USE haulage_truck_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Trucks table
CREATE TABLE IF NOT EXISTS trucks (
  id VARCHAR(36) PRIMARY KEY,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  capacity INT NOT NULL COMMENT 'Capacity in tons',
  status ENUM('available', 'in_use', 'maintenance') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id VARCHAR(36) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  truck_id VARCHAR(36),
  driver_id VARCHAR(36),
  weight INT NOT NULL COMMENT 'Weight in kg',
  status ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE SET NULL,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

-- Insert demo data
INSERT IGNORE INTO users (id, name, email, password) VALUES
('1', 'Demo User', 'demo@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT IGNORE INTO trucks (id, registration_number, make, model, capacity, status) VALUES
('1', 'ABC-123', 'Volvo', 'FH16', 25, 'available'),
('2', 'XYZ-456', 'Scania', 'R500', 30, 'in_use');

INSERT IGNORE INTO drivers (id, name, email, phone, license_number, status) VALUES
('1', 'John Smith', 'john@example.com', '+1234567890', 'DL123456', 'active'),
('2', 'Sarah Johnson', 'sarah@example.com', '+1234567891', 'DL789012', 'active');

INSERT IGNORE INTO deliveries (id, order_number, origin, destination, truck_id, driver_id, weight, status) VALUES
('1', 'ORD-001', 'Warehouse A', 'Store B', '1', '1', 15000, 'in_progress'),
('2', 'ORD-002', 'Factory C', 'Distribution D', '2', '2', 20000, 'pending');
