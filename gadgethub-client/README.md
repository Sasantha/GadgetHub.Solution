# The Gadget Hub - Client Application

React TypeScript frontend for The Gadget Hub e-commerce platform.

## Overview

The Gadget Hub is a specialized e-commerce platform that sells the latest gadgets without holding inventory. Instead, it works with three distributors (TechWorld, ElectroCom, and Gadget Central) to fulfill orders by requesting quotations and selecting the best options for customers.

## Features

- **Product Catalog**: Browse and search through the latest gadgets
- **Smart Quotation System**: Get quotes from multiple distributors automatically
- **Shopping Cart**: Add products and manage quantities
- **Multi-Distributor Checkout**: Compare prices and delivery times from different distributors
- **Order Tracking**: Track orders placed with various distributors
- **Responsive Design**: Modern, mobile-friendly interface

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── layout/          # Header, Footer, Navigation
│   ├── product/         # Product-related components
│   ├── cart/            # Shopping cart components
│   ├── checkout/        # Checkout process components
│   ├── order/           # Order tracking components
│   └── common/          # Shared components
├── pages/               # Page components
├── services/            # API service classes
├── contexts/            # React context providers
├── hooks/               # Custom React hooks
├── types/               # TypeScript interfaces
├── utils/               # Utility functions
├── assets/              # Images, icons, etc.
└── styles/              # CSS/SCSS files
```

## Technology Stack

- **React 19** with TypeScript
- **React Context** for state management
- **CSS Modules** for styling
- **Fetch API** for HTTP requests
- **React Router** for navigation (to be added)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Running instance of GadgetHub.API

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment configuration:
   ```bash
   cp .env.example .env.local
   ```

4. Update the API URL in `.env.local` to match your backend:
   ```
   REACT_APP_API_BASE_URL=http://localhost:5058/api
   ```

5. Start the development server:
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`.

## Vercel Deployment

Set this environment variable in Vercel:

```bash
REACT_APP_API_BASE_URL=https://your-render-service.onrender.com/api
```

The app still accepts `REACT_APP_API_URL`, but `REACT_APP_API_BASE_URL` is the preferred variable name.

## API Integration

The client communicates with the GadgetHub.API backend for:

- Product catalog management
- Shopping cart operations
- Quotation requests to distributors
- Order placement and tracking
- Customer management

## Business Process Flow

1. **Customer Browsing**: Users browse products from the catalog
2. **Add to Cart**: Products are added to the shopping cart
3. **Checkout Process**:
   - Customer enters shipping information
   - System requests quotations from all three distributors
   - Customer reviews and selects the best options
   - Order is placed with chosen distributor(s)
4. **Order Fulfillment**: Distributors fulfill and ship orders
5. **Tracking**: Customers can track their orders

## Development Commands

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App (not recommended)

## Contributing

1. Follow TypeScript best practices
2. Use meaningful component and function names
3. Add proper error handling
4. Test your changes thoroughly
5. Update documentation as needed

## Related Projects

- **GadgetHub.API** - .NET backend API
- **Distributor Services** - TechWorld, ElectroCom, Gadget Central APIs
