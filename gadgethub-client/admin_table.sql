-- Admin Table for The Gadget Hub System
-- Add this to your existing GadgetHub database

USE GadgetHub;

-- Table 8: Admins (System administrators)
CREATE TABLE Admins (
    Id VARCHAR(36) PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Role ENUM('admin', 'super_admin', 'manager') DEFAULT 'admin',
    IsActive BOOLEAN DEFAULT TRUE,
    LastLoginAt TIMESTAMP NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample admin users for testing
INSERT INTO Admins (Id, Username, Email, PasswordHash, FirstName, LastName, Role, IsActive) VALUES
(UUID(), 'admin', 'admin@gadgethub.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System', 'Administrator', 'super_admin', TRUE),
(UUID(), 'manager1', 'manager@gadgethub.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'John', 'Manager', 'manager', TRUE),
(UUID(), 'support1', 'support@gadgethub.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sarah', 'Support', 'admin', TRUE);

-- Note: All passwords are hashed version of "password123" for demo purposes
-- In production, use proper password hashing with bcrypt or similar

-- Create index for faster lookups
CREATE INDEX idx_admin_username ON Admins(Username);
CREATE INDEX idx_admin_email ON Admins(Email);
CREATE INDEX idx_admin_active ON Admins(IsActive);

-- Display the created table structure
DESCRIBE Admins; 