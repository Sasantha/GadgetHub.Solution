-- The Gadget Hub - Simple Database Schema (7 Tables)
-- Educational Assessment Version

CREATE DATABASE IF NOT EXISTS GadgetHub;
USE GadgetHub;

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

-- Table 1: Products (Gadgets Catalog)
CREATE TABLE Products (
    Id VARCHAR(36) PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    Category VARCHAR(100),
    Brand VARCHAR(100),
    ImageUrl VARCHAR(500),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Customers
CREATE TABLE Customers (
    Id VARCHAR(36) PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Phone VARCHAR(20),
    Address TEXT,
    PasswordHash VARCHAR(255) NULL,        -- NEW COLUMN
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customers_email (Email)      -- NEW INDEX
);

-- Table 3: Distributors (TechWorld, ElectroCom, Gadget Central)
CREATE TABLE Distributors (
    Id VARCHAR(36) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Type ENUM('TechWorld', 'ElectroCom', 'GadgetCentral') NOT NULL,
    ContactInfo VARCHAR(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: Cart Items (Shopping Cart)
CREATE TABLE CartItems (
    Id VARCHAR(36) PRIMARY KEY,
    CustomerId VARCHAR(36) NOT NULL,
    ProductId VARCHAR(36) NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    AddedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
);

-- Table 5: Quotation Requests (Step 2: Request quotes from distributors)
CREATE TABLE QuotationRequests (
    Id VARCHAR(36) PRIMARY KEY,
    CustomerId VARCHAR(36) NOT NULL,
    ProductId VARCHAR(36) NOT NULL,
    Quantity INT NOT NULL,
    Status ENUM('pending', 'completed') DEFAULT 'pending',
    RequestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
);

-- Table 6: Quotation Responses (Step 3: Distributor responses)
CREATE TABLE QuotationResponses (
    Id VARCHAR(36) PRIMARY KEY,
    RequestId VARCHAR(36) NOT NULL,
    DistributorId VARCHAR(36) NOT NULL,
    ProductId VARCHAR(36) NOT NULL,
    PricePerUnit DECIMAL(10,2) NOT NULL,
    AvailableQuantity INT NOT NULL,
    EstimatedDeliveryDays INT,
    Status ENUM('unseen', 'seen') DEFAULT 'unseen',
    RespondedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RequestId) REFERENCES QuotationRequests(Id),
    FOREIGN KEY (DistributorId) REFERENCES Distributors(Id),
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
);

-- Table 7: Orders (Step 5-7: Final orders with selected distributors)
CREATE TABLE Orders (
    Id VARCHAR(36) PRIMARY KEY,
    CustomerId VARCHAR(36) NOT NULL,
    DistributorId VARCHAR(36) NOT NULL,
    ProductId VARCHAR(36) NOT NULL,
    Quantity INT NOT NULL,
    PricePerUnit DECIMAL(10,2) NOT NULL,
    TotalAmount DECIMAL(10,2) NOT NULL,
    Status ENUM('pending', 'confirmed', 'shipped', 'delivered') DEFAULT 'pending',
    DistributorOrderId VARCHAR(100), -- Order ID from distributor
    EstimatedDelivery DATE,
    PlacedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    FOREIGN KEY (DistributorId) REFERENCES Distributors(Id),
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
);

-- Insert Sample Data
INSERT INTO Distributors (Id, Name, Type, ContactInfo) VALUES
('d1', 'TechWorld', 'TechWorld', 'contact@techworld.com'),
('d2', 'ElectroCom', 'ElectroCom', 'contact@electrocom.com'),
('d3', 'Gadget Central', 'GadgetCentral', 'contact@gadgetcentral.com');

-- Updated Products with Working Image URLs
INSERT INTO Products (Id, Name, Description, Category, Brand, ImageUrl) VALUES
('p1', 'iPhone 15 Pro', 'Latest Apple smartphone with titanium design and A17 Pro chip', 'Smartphones', 'Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop&auto=format'),
('p2', 'Samsung Galaxy S24', 'Android flagship phone with AI features and excellent camera', 'Smartphones', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&auto=format'),
('p3', 'MacBook Air M3', 'Apple laptop with M3 chip, perfect for productivity and creativity', 'Laptops', 'Apple', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop&auto=format'),
('p4', 'Dell XPS 13', 'Windows ultrabook with premium build and excellent performance', 'Laptops', 'Dell', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop&auto=format'),
('p5', 'AirPods Pro', 'Wireless earbuds with active noise cancellation', 'Audio', 'Apple', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop&auto=format'),
('p6', 'iPad Pro 12.9', 'Professional tablet with M2 chip and Apple Pencil support', 'Tablets', 'Apple', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop&auto=format'),
('p7', 'Sony WH-1000XM5', 'Premium noise-canceling headphones with exceptional sound quality', 'Audio', 'Sony', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop&auto=format'),
('p8', 'Nintendo Switch OLED', 'Gaming console with vibrant OLED screen', 'Gaming', 'Nintendo', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop&auto=format');

INSERT INTO Customers (Id, FirstName, LastName, Email, Phone, Address) VALUES
('c1', 'John', 'Doe', 'john@email.com', '1234567890', '123 Main St, New York, NY 10001'); 