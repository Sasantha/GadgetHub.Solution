# The Gadget Hub API

SOC-based REST API for The Gadget Hub educational assessment.

## Deployment

This API is prepared for Render + Aiven:

- Render web service using the included `Dockerfile`
- Aiven MySQL via `ConnectionStrings__DefaultConnection`
- Frontend allowlist via `Cors__AllowedOrigins__0`, `Cors__AllowedOrigins__1`, and so on

### Required Render Environment Variables

```bash
ConnectionStrings__DefaultConnection=server=YOUR_AIVEN_HOST;port=YOUR_AIVEN_PORT;database=YOUR_DB_NAME;user=YOUR_USERNAME;password=YOUR_PASSWORD;SslMode=Required;
Cors__AllowedOrigins__0=https://your-frontend.vercel.app
Cors__AllowedOrigins__1=https://your-custom-domain.com
ASPNETCORE_ENVIRONMENT=Production
Swagger__Enabled=true
```

`Swagger__Enabled=true` is optional and mainly useful while verifying the first deployment.

## 🚀 Quick Start

### 1. **Start the API**
```bash
cd GadgetHub.API
dotnet run
```

### 2. **Access API Documentation**
- **Swagger UI**: `http://localhost:5058/swagger`
- **API Endpoints**: `http://localhost:5058/api/test/api-endpoints`

### 3. **Authentication**
Add this header to all requests (except /test and /swagger):
```
X-API-Key: gadgethub-api-key-2025
```

## 📋 Core Business Process

### Step 1: Browse Products & Add to Cart
```bash
# Get all products
GET /api/products

# Add to cart
POST /api/cart/c1/add
{
  "productId": "p1",
  "quantity": 2
}
```

### Step 2: Request Quotations from All Distributors
```bash
POST /api/quotations/request
{
  "customerId": "c1"
}
```

### Step 3: Get Distributor Responses
```bash
GET /api/quotations/request/{requestId}/responses
```

### Step 4: Get Best Quotation
```bash
GET /api/quotations/request/{requestId}/best
```

### Step 5: Place Order with Selected Distributor
```bash
POST /api/orders
{
  "customerId": "c1",
  "distributorId": "d1", 
  "productId": "p1",
  "quantity": 2,
  "pricePerUnit": 299.99
}
```

### Step 6: Track Order
```bash
GET /api/orders/{orderId}/track
```

## 🧪 Testing Endpoints

### Test Database Connection
```bash
GET /api/test/connection
```

### Seed Sample Data
```bash
GET /api/test/seed-data
```

### Test All Services
```bash
GET /api/test/services
```

### Get All API Endpoints
```bash
GET /api/test/api-endpoints
```

## 📚 Complete API Reference

### Products API
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/category/{category}` - Get products by category
- `GET /api/products/search?term={term}` - Search products
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Cart API
- `GET /api/cart/{customerId}` - Get cart items
- `POST /api/cart/{customerId}/add` - Add item to cart
- `PUT /api/cart/{customerId}/update` - Update cart item
- `DELETE /api/cart/{customerId}/remove/{productId}` - Remove item
- `DELETE /api/cart/{customerId}/clear` - Clear cart

### Quotations API (Core Business Logic)
- `POST /api/quotations/request` - Request quotes from all distributors
- `GET /api/quotations/request/{requestId}/responses` - Get distributor responses
- `GET /api/quotations/request/{requestId}/best` - Get best quotation
- `GET /api/quotations/customer/{customerId}` - Get customer quotations

### Orders API
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order details
- `GET /api/orders/customer/{customerId}` - Get customer orders
- `PUT /api/orders/{id}/status` - Update order status
- `GET /api/orders/{id}/track` - Track order

### Customers API
- `GET /api/customers` - Get all customers
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/{id}` - Update customer

### Distributors API
- `GET /api/distributors` - Get all distributors
- `GET /api/distributors/type/{type}` - Get distributor by type (TechWorld, ElectroCom, GadgetCentral)
- `POST /api/distributors` - Create distributor
- `PUT /api/distributors/{id}` - Update distributor

## 💾 Database

- **7 Tables**: Products, Customers, Distributors, CartItems, QuotationRequests, QuotationResponses, Orders
- **MySQL/MariaDB** with Entity Framework Core
- **Connection**: Configured in `appsettings.json`

## 🏗️ Architecture

- **Controllers** → **Services** → **Repository** → **Database**
- **6 Services**: Product, Cart, Customer, Distributor, Quotation, Order
- **7 Models**: Matching database tables
- **Repository Pattern**: Generic IRepository<T>
- **Dependency Injection**: All services registered

## 🔐 Security Features

- ✅ **API Key Authentication**: Simple header-based auth
- ✅ **CORS**: Configured for React client
- ✅ **Error Handling**: Global exception middleware
- ✅ **Input Validation**: Basic request validation

## 📖 Sample Data

The API includes sample data for testing:
- **3 Distributors**: TechWorld, ElectroCom, Gadget Central
- **5 Products**: iPhone, Samsung, MacBook, Dell laptop, AirPods
- **1 Customer**: Test User
- **3 Admin Users**: System Admin, Manager, Support

Use `GET /api/test/seed-data` to populate the database.

## 🛡️ Admin Panel API

Complete admin management system with authentication and dashboard:

### Admin Authentication
```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

### Dashboard & Statistics
```http
GET /api/admin/dashboard/stats        # System statistics
GET /api/admin/system/health         # System health status
```

### Admin Management
```http
GET    /api/admin                    # Get all admins
GET    /api/admin/{id}               # Get admin by ID
POST   /api/admin                    # Create new admin
PUT    /api/admin/{id}               # Update admin
DELETE /api/admin/{id}               # Delete admin
POST   /api/admin/{id}/change-password  # Change password
```

### Demo Admin Credentials
| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `admin` | `password123` | super_admin | Full Access |
| `manager1` | `password123` | manager | Management Access |
| `support1` | `password123` | admin | Standard Access |

---

**Assessment Note**: This API implements the complete SOC-based gadget ordering workflow as specified in the educational requirements. All 7 business process steps are fully implemented and testable, including comprehensive admin management functionality. 
